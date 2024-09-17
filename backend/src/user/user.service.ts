import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginRequestDto,
  UserResponseDto,
  RequestPasswordResetDto,
  VerifySecurityQuestionDto,
  ResetPasswordDto,
  UpdateApiTokenDto,
  ApiTokenResponseDto,
} from './dto';
import { plainToInstance } from 'class-transformer';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Binary, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For generating unique tokens
import * as nodemailer from 'nodemailer'; // For sending emails
import { google } from 'googleapis';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly securityQuestions: string[] = [
    'What was your childhood nickname?',
    'What is the name of your favorite childhood friend?',
    'What was the name of your first pet?',
    'What is your favorite movie?',
    "What is your neighbour's last name?",
  ];

  private defaultImagePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'images',
    'default-profile-image.png',
  );

  // OAuth2 client setup
  private oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID, // ClientID
    process.env.OAUTH_CLIENT_SECRET, // Client Secret
    'https://developers.google.com/oauthplayground', // Redirect URL
  );

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {
    // Set OAuth2 credentials
    this.oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });
  }

  // Create a new user and automatically log them in
  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const { username, email, image } = createUserDto;

    // Check if username already exists
    const existingUsername = await this.userRepository.findOneBy({
      username: username,
    });
    if (existingUsername) {
      throw new HttpException(
        'Username already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOneBy({ email: email });
    if (existingEmail) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    let binaryImage: Binary;

    // Handle image or set default image
    if (image) {
      binaryImage = new Binary(Buffer.from(image.buffer));
    } else {
      // Load default image and convert it to binary
      const defaultImage = fs.readFileSync(this.defaultImagePath);
      binaryImage = new Binary(defaultImage);
    }

    const newUser = plainToInstance(UserEntity, {
      ...createUserDto,
      image: binaryImage,
    });

    const savedUser = await this.userRepository.save(newUser);
    const token = this.generateJWT(savedUser);
    return {
      user: this.buildUserResponse(savedUser),
      token,
    };
  }

  // Update user details
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findEntityById(id); // Fetch the entity, not DTO

    let binaryImage: Binary;

    // Handle image update or keep existing one
    if (updateUserDto.image && updateUserDto.image.buffer) {
      // Convert the uploaded file to MongoDB Binary, extract from image buffer
      binaryImage = new Binary(Buffer.from(updateUserDto.image.buffer));
    } else {
      // Keep the existing image if no new image is provided
      binaryImage = user.image;
    }

    // Update user fields and assign the processed binary image
    Object.assign(user, plainToInstance(UserEntity, updateUserDto));
    user.image = binaryImage;

    const updatedUser = await this.userRepository.save(user);
    return this.buildUserResponse(updatedUser);
  }

  // Find user by ID
  async findById(id: string): Promise<UserResponseDto> {
    const objectId = new ObjectId(id); // convert string to MongoDB ObjectId
    this.logger.log('findById: Created ObjectId from string', objectId);
    const user = await this.userRepository.findOneBy({ _id: objectId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.buildUserResponse(user);
  }

  // Update API tokens
  async updateApiToken(
    id: string,
    updateApiTokenDto: UpdateApiTokenDto,
  ): Promise<void> {
    const objectId = new ObjectId(id); // convert string to MongoDB ObjectId
    this.logger.log('updateApiToken: Created ObjectId from string', objectId);
    const user = await this.userRepository.findOneBy({ _id: objectId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.apiToken = {
      ...user.apiToken,
      ...updateApiTokenDto,
    };
    await this.userRepository.save(user);
  }

  // Retrieve API tokens
  async getApiToken(id: string): Promise<ApiTokenResponseDto> {
    const objectId = new ObjectId(id); // convert string to MongoDB ObjectId
    this.logger.log('getApiToken: Created ObjectId from string', objectId);
    const user = await this.userRepository.findOneBy({ _id: objectId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Create the response object
    const apiTokenData = {
      defaultModel: user.apiToken?.defaultModel || '',
      geminiKey: user.apiToken?.geminiKey ? 'SET' : 'UNSET',
      openaiKey: user.apiToken?.openaiKey ? 'SET' : 'UNSET',
    };

    // Map to ApiTokenResponseDto
    return plainToInstance(ApiTokenResponseDto, apiTokenData);
  }

  // Authenticate user during login
  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const { username, password } = loginRequestDto;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.generateJWT(user);
    return {
      user: this.buildUserResponse(user), // Return only the user response DTO
      token, // Return the token for setting the cookie
    };
  }

  // Generate JWT token
  generateJWT(user: UserEntity): string {
    return jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );
  }

  // Map UserEntity to UserResponseDto, ensuring the image is base64-encoded
  public buildUserResponse(user: UserEntity): UserResponseDto {
    const response = plainToInstance(UserResponseDto, user);

    // Convert the binary image data to Base64
    response.image = Buffer.from(user.image.buffer).toString('base64');

    return response;
  }

  // Retrieves raw entity by ID, required for authentication middleware
  async findEntityById(id: string): Promise<UserEntity> {
    const objectId = new ObjectId(id); // convert string to MongoDB ObjectId
    this.logger.log('findEntityById: Created ObjectId from string', objectId);
    const user = await this.userRepository.findOneBy({ _id: objectId });
    if (!user) {
      this.logger.log('User not found', id);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // Get list of security questions
  getSecurityQuestions(): string[] {
    return this.securityQuestions;
  }

  // Fetch security question using the reset token
  async getSecurityQuestion(token: string): Promise<string> {
    const user = await this.userRepository.findOneBy({
      passwordResetToken: token,
    });
    if (!user || user.passwordResetTokenExpiry < new Date()) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Return the user's security question
    return user.securityQuestion;
  }

  // Initiate password reset
  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Generate a reset token and set expiry duration
    const token = uuidv4();
    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    await this.userRepository.save(user);

    // Send email with reset link
    await this.sendResetEmail(user.email, token);
  }

  // Send reset email
  private async sendResetEmail(email: string, token: string): Promise<void> {
    // Obtain the access token from OAuth2 client (access token is short-lived, thus not defined in .env file)
    const accessToken = await this.oauth2Client.getAccessToken();
    // Configure email transport using OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Send email
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ExpenseNote - Password Reset Request',
      text: `Click the link to reset your password: ${resetLink}`,
    });
  }

  // Verify security question
  async verifySecurityQuestion(
    verifySecurityQuestionDto: VerifySecurityQuestionDto,
  ): Promise<boolean> {
    const { token, answer } = verifySecurityQuestionDto;
    const user = await this.userRepository.findOneBy({
      passwordResetToken: token,
    });
    if (!user || user.passwordResetTokenExpiry < new Date()) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify the answer
    return await argon2.verify(user.securityAnswer, answer.toLowerCase());
  }

  // Reset the password
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    const user = await this.userRepository.findOneBy({
      passwordResetToken: token,
    });
    if (!user || user.passwordResetTokenExpiry < new Date()) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;

    await this.userRepository.save(user);

    // Send a confirmation email
    await this.sendConfirmationEmail(user.email);
  }

  // Send confirmation email
  private async sendConfirmationEmail(email: string): Promise<void> {
    // Obtain the access token from OAuth2 client
    const accessToken = await this.oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ExpenseNote - Password Changed',
      text: 'Your password has been successfully changed.',
    });
  }
}
