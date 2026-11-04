import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for user' })
  async getNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }
}
