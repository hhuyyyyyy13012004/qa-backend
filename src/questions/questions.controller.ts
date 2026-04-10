import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  // ── Public routes ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get all questions (public)' })
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @ApiOperation({ summary: 'Get question detail' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  // ── Auth required ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create new question (public immediately)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateQuestionDto, @CurrentUser() user: User) {
    return this.questionsService.create(dto, user);
  }

  @ApiOperation({ summary: 'Get my questions' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-questions')
  getMyQuestions(@CurrentUser() user: User) {
    return this.questionsService.findMyQuestions(user.id);
  }

  @ApiOperation({ summary: 'Update my question' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete my question' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.questionsService.remove(id, user);
  }
}
