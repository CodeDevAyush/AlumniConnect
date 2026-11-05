import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnnouncementsService, CreateCommunityPostDto } from './announcements.service';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutional announcements and community mentor updates' })
  async getAnnouncements() {
    return this.announcementsService.getLatestAnnouncements();
  }

  @Post()
  @ApiOperation({ summary: 'Create a community update / mentor post' })
  async createAnnouncement(@Body() body: CreateCommunityPostDto) {
    return this.announcementsService.createAnnouncement(body);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a community post' })
  async likeAnnouncement(@Param('id') id: string) {
    return this.announcementsService.likeAnnouncement(id);
  }
}
