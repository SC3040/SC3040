import { ApiProperty } from '@nestjs/swagger';

export class ApiTokenResponseDto {
  @ApiProperty({
    description:
      'Default model (GEMINI or OPENAI). Will be an empty string if not selected.',
    example: 'GEMINI',
    default: '', // Default value is an empty string
  })
  readonly defaultModel: string;

  @ApiProperty({
    description: 'Indicates if the Gemini key is set or not.',
    example: 'SET',
    default: 'UNSET',
  })
  readonly geminiKey: string;

  @ApiProperty({
    description: 'Indicates if the OpenAI key is set or not.',
    example: 'SET',
    default: 'UNSET',
  })
  readonly openaiKey: string;
}
