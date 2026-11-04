import { Injectable } from '@nestjs/common';

@Injectable()
export class AnnouncementsService {
  async getLatestAnnouncements() {
    return [
      {
        id: 'ann-1',
        title: 'Welcome to AlumniConnect Platform Launch',
        content: 'Connect with alumni mentors, explore referrals, and accelerate your career pathway.',
        publishedAt: new Date().toISOString(),
      },
    ];
  }
}
