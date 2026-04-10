import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestionDto {
  @ApiPropertyOptional({ example: 'Updated question title?' })
  @IsString()
  @IsOptional()
  @MinLength(10)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated question content...' })
  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;
}
