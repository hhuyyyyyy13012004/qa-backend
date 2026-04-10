import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import type { Request } from 'express';
@ApiTags('Likes & Shares')
@Controller()
export class LikesController {
  constructor(private likesService: LikesService) {}

  // ── Like routes ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Toggle like on a post (like/unlike)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  togglePostLike(@Param('id') id: string, @CurrentUser() user: User) {
    return this.likesService.togglePostLike(id, user);
  }

  @ApiOperation({ summary: 'Toggle like on a question (like/unlike)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('questions/:id/like')
  toggleQuestionLike(@Param('id') id: string, @CurrentUser() user: User) {
    return this.likesService.toggleQuestionLike(id, user);
  }

  @ApiOperation({ summary: 'Get like count of a post' })
  @Get('posts/:id/likes')
  getPostLikes(@Param('id') id: string) {
    return this.likesService.getPostLikes(id);
  }

  @ApiOperation({ summary: 'Get like count of a question' })
  @Get('questions/:id/likes')
  getQuestionLikes(@Param('id') id: string) {
    return this.likesService.getQuestionLikes(id);
  }

  // ── Share routes ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get shareable link for a post' })
  @Get('posts/:id/share')
  sharePost(@Param('id') id: string, @Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}/api`;
    return this.likesService.sharePost(id, baseUrl);
  }

  @ApiOperation({ summary: 'Get shareable link for a question' })
  @Get('questions/:id/share')
  shareQuestion(@Param('id') id: string, @Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}/api`;
    return this.likesService.shareQuestion(id, baseUrl);
  }
}
