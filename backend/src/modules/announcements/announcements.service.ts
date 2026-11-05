import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  InMemoryPrototypeStore,
  PrototypeCommunityPost,
} from '../../database/in-memory-prototype.store';

export interface CreateCommunityPostDto {
  title: string;
  content: string;
  category?: 'MENTOR_UPDATE' | 'TECH_INSIGHT' | 'REFERRAL' | 'EVENT';
  authorName?: string;
  authorRole?: string;
  authorCompany?: string;
  tags?: string[];
  userRole?: string;
}

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prototypeStore: InMemoryPrototypeStore) {}

  async getLatestAnnouncements(): Promise<PrototypeCommunityPost[]> {
    return this.prototypeStore.getCommunityPosts();
  }

  async createAnnouncement(
    dto: CreateCommunityPostDto,
    fallbackUser?: { name?: string; role?: string },
  ): Promise<PrototypeCommunityPost> {
    const role = (dto.userRole || fallbackUser?.role || dto.authorRole || '').toUpperCase();
    if (role === 'STUDENT') {
      throw new ForbiddenException(
        'Only verified alumni and mentors can publish updates to the community feed. Students can read and interact with posts.',
      );
    }

    return this.prototypeStore.addCommunityPost({
      title: dto.title,
      content: dto.content,
      category: dto.category || 'MENTOR_UPDATE',
      authorName: dto.authorName || fallbackUser?.name || 'Verified Mentor',
      authorRole: dto.authorRole || fallbackUser?.role || 'Senior Alumni Mentor',
      authorCompany: dto.authorCompany || 'Alumni Network',
      tags: dto.tags && dto.tags.length > 0 ? dto.tags : ['Mentorship', 'Career'],
    });
  }

  async likeAnnouncement(postId: string): Promise<{ success: boolean }> {
    const success = this.prototypeStore.likeCommunityPost(postId);
    return { success };
  }
}
