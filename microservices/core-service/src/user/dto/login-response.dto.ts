import { UserResponseDto } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Logged in user details' })
  readonly user: UserResponseDto;
  @ApiProperty({ description: 'JWT token for authentication' })
  readonly token: string;
}
