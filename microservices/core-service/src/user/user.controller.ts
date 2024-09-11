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
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginRequestDto,
  UserResponseDto,
  LoginResponseDto,
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
    type: LoginResponseDto,
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
  ): Promise<LoginResponseDto> {
    createUserDto.image = image || null;
    return this.userService.create(createUserDto);
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
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return this.userService.login(loginUserDto);
  }
}
