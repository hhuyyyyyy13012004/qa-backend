import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get my notifications' })
  @Get()
  findMyNotifications(@CurrentUser() user: User) {
    return this.notificationsService.findMyNotifications(user.id);
  }

  @ApiOperation({ summary: 'Count unread notifications' })
  @Get('unread/count')
  countUnread(@CurrentUser() user: User) {
    return this.notificationsService.countUnread(user.id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Patch('read/all')
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user);
  }
}
