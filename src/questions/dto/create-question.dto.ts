import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'How does NestJS dependency injection work?' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  title!: string;

  @ApiProperty({
    example: 'I am trying to understand how DI works in NestJS...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content!: string;
}
