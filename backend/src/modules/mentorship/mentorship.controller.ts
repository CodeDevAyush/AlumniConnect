import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MentorshipService } from './mentorship.service';

@ApiTags('Mentorship')
@Controller('mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Get('requests/:userId')
  @ApiOperation({ summary: 'List mentorship requests involving user' })
  async listRequests(@Param('userId') userId: string) {
    return this.mentorshipService.listRequests(userId);
  }
}
