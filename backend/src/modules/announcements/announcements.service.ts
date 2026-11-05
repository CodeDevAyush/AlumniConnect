import { Injectable } from '@nestjs/common';
import {
  InMemoryPrototypeStore,
  PrototypeCommunityPost,
} from '../../database/in-memory-prototype.store';

export interface CreateCommunityPostDto {
  title: string;
  content: string;
  category?: 'MENTOR_UPDATE' | 'TECH_INSIGHT' | 'REFERRAL' | 'STUDENT_UPDATE' | 'EVENT';
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
    const isStudent =
      (dto.userRole || fallbackUser?.role || dto.authorRole || '').toUpperCase() === 'STUDENT';

    const defaultRole = isStudent ? 'Student Candidate' : 'Senior Alumni Mentor';
    const defaultCategory = isStudent ? 'STUDENT_UPDATE' : 'MENTOR_UPDATE';
    const defaultCompany = isStudent ? 'Campus Student' : 'Alumni Network';

    return this.prototypeStore.addCommunityPost({
      title: dto.title,
      content: dto.content,
      category: dto.category || defaultCategory,
      authorName: dto.authorName || fallbackUser?.name || (isStudent ? 'Candidate Student' : 'Verified Mentor'),
      authorRole: dto.authorRole || fallbackUser?.role || defaultRole,
      authorCompany: dto.authorCompany || defaultCompany,
      tags: dto.tags && dto.tags.length > 0 ? dto.tags : [isStudent ? 'Project' : 'Mentorship', 'Career'],
    });
  }

  async likeAnnouncement(postId: string): Promise<{ success: boolean }> {
    const success = this.prototypeStore.likeCommunityPost(postId);
    return { success };
  }
}
