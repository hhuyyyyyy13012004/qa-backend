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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // ── Public routes ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get all approved posts (public)' })
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @ApiOperation({ summary: 'Get post detail' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.findOne(id, user);
  }

  // ── Auth required ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create new post (saved as DRAFT)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user);
  }

  @ApiOperation({ summary: 'Get my posts (all statuses)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-posts')
  getMyPosts(@CurrentUser() user: User) {
    return this.postsService.findMyPosts(user.id);
  }

  @ApiOperation({ summary: 'Submit post for review (DRAFT → PENDING)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.submit(id, user);
  }

  @ApiOperation({ summary: 'Update post content' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.remove(id, user);
  }

  // ── Admin only ───────────────────────────────────────────────────

  @ApiOperation({ summary: '[ADMIN] Get all posts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  findAllAdmin() {
    return this.postsService.findAllAdmin();
  }

  @ApiOperation({ summary: '[ADMIN] Approve post (PENDING → APPROVED)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.postsService.approve(id, user);
  }

  @ApiOperation({ summary: '[ADMIN] Reject post (PENDING → REJECTED)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: { reason?: string },
  ) {
    return this.postsService.reject(id, user, body.reason);
  }
}
