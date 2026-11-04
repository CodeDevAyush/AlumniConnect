import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getUserNotifications(userId: string) {
    return [
      {
        id: 'notif-1',
        userId,
        title: 'Welcome to AlumniConnect',
        message: 'Your profile has been initialized.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
