import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import {
  StudentEvidencePayload,
  JobDescriptionAnalysisRequest,
  ProjectSubmissionPayload,
  CareerGuidanceRequest,
} from '../ai-client/ai-client.service';

@ApiTags('Intelligence Subsystem')
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('capability/tracks')
  @ApiOperation({ summary: 'List supported technical tracks, dimension weights & skill baselines' })
  async getTracks() {
    return this.intelligenceService.getTracks();
  }

  @Post('capability/assess/:userId')
  @ApiOperation({ summary: 'Run 5-dimensional student capability assessment' })
  async assessStudent(
    @Param('userId') userId: string,
    @Body() payload: Partial<StudentEvidencePayload>,
  ) {
    return this.intelligenceService.assessStudent(userId, payload);
  }

  @Post('skills/gap-analysis/:userId')
  @ApiOperation({ summary: 'Extract skills from job description and compare against student profile' })
  async analyzeSkillGap(
    @Param('userId') userId: string,
    @Body() payload: JobDescriptionAnalysisRequest,
  ) {
    return this.intelligenceService.analyzeSkillGap(userId, payload);
  }

  @Post('coding/analyze/:userId')
  @ApiOperation({ summary: 'Analyze student LeetCode & Codeforces coding profiles' })
  async analyzeCoding(
    @Param('userId') userId: string,
    @Body() payload: { leetcodeUsername?: string; codeforcesHandle?: string },
  ) {
    return this.intelligenceService.analyzeCoding(userId, payload);
  }

  @Post('projects/evaluate')
  @ApiOperation({ summary: 'Evaluate student technical project submission against engineering rubrics' })
  async evaluateProject(@Body() payload: ProjectSubmissionPayload) {
    return this.intelligenceService.evaluateProject(payload);
  }

  @Post('recommendations/career/:userId')
  @ApiOperation({ summary: 'Generate personalized milestone roadmap and career guidance' })
  async getCareerGuidance(
    @Param('userId') userId: string,
    @Body() payload: Partial<CareerGuidanceRequest>,
  ) {
    return this.intelligenceService.getCareerGuidance(userId, payload);
  }

  @Post('alumni-match/:userId')
  @ApiOperation({ summary: 'Intelligently match student with alumni mentors and referral champions' })
  async matchAlumni(
    @Param('userId') userId: string,
    @Body() body: { topK?: number; targetRoles?: string[] },
  ) {
    return this.intelligenceService.matchAlumni(userId, body);
  }
}

