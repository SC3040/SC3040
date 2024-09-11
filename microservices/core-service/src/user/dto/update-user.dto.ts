import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Unique username of the user', example: 'user' })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'First name of the user', example: 'Mike' })
  @IsNotEmpty()
  readonly firstName?: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Ross' })
  @IsNotEmpty()
  readonly lastName?: string;

  @ApiProperty({
    description: 'Strong password for the user',
    required: false,
    example: 'P@ssword123',
  })
  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  readonly password?: string;

  @ApiProperty({
    description: 'Updated profile image to be uploaded as binary',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File; // Binary image file
}
