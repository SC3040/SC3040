import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UsePipes,
  HttpCode,
  UploadedFile,
  UseInterceptors,
  Logger,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginRequestDto,
  UserResponseDto,
} from './dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { User } from './user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data') // To handle file uploads
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and logged in.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Username or email already exists.',
  })
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image')) // Handle file upload for image
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() image: Express.Multer.File, // multipart/form-data file is handled separately from other fields in the body, thus not automatically mapped to the DTO
    @Res({ passthrough: true }) res: Response, // Inject Response to modify cookies
  ): Promise<UserResponseDto> {
    createUserDto.image = image || null;

    // Get the user and token from the service
    const { user, token } = await this.userService.create(createUserDto);

    // Set the JWT token as an HttpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Secure from JavaScript access
      // secure: true,
      sameSite: 'strict', // Helps mitigate CSRF
      maxAge: 60 * 60 * 1000, // Cookie expiration (1 hour)
    });

    return user; // Return user details only (no token)
  }

  @UsePipes(new ValidationPipe())
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current logged in user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Current logged in user profile successfully updated.',
    type: UserResponseDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateUser(
    @User('_id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File, // multipart/form-data file is handled separately from other fields in the body, thus not automatically mapped to the DTO
  ): Promise<UserResponseDto> {
    updateUserDto.image = image || null;
    return this.userService.update(userId, updateUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged in user details' })
  @ApiResponse({
    status: 200,
    description: 'Current logged in user details retrieved successfully.',
    type: UserResponseDto,
  })
  async getCurrentUser(@User('_id') userId: string): Promise<UserResponseDto> {
    this.logger.log('Extracted user ID from decorator:', userId);
    return await this.userService.findById(userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response, // Inject Response to modify cookies
  ): Promise<UserResponseDto> {
    const { user, token } = await this.userService.login(loginUserDto);

    // Set the JWT token as an HttpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Secure from JavaScript access
      // secure: true,
      sameSite: 'strict', // Helps mitigate CSRF
      maxAge: 60 * 60 * 1000, // Cookie expiration (1 hour)
    });

    return user;
  }
}
