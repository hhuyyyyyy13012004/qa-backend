import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a great post!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({ description: 'Post ID (if commenting on a post)' })
  @IsUUID()
  @IsOptional()
  postId?: string;

  @ApiPropertyOptional({
    description: 'Question ID (if commenting on a question)',
  })
  @IsUUID()
  @IsOptional()
  questionId?: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID (if replying to a comment)',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
