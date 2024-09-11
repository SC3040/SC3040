import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginRequestDto,
  LoginResponseDto,
  UserResponseDto,
} from './dto';
import { plainToInstance } from 'class-transformer';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Binary, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  private defaultImagePath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'images',
    'default-profile-image.png',
  );

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  // Create a new user and automatically log them in
  async create(createUserDto: CreateUserDto): Promise<LoginResponseDto> {
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
    } else if (!user.image) {
      // Load default image if no image exists
      const defaultImage = fs.readFileSync(this.defaultImagePath);
      binaryImage = new Binary(defaultImage);
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

  // Authenticate user during login
  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { username, password } = loginRequestDto;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.generateJWT(user);
    return {
      user: this.buildUserResponse(user),
      token,
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
}
