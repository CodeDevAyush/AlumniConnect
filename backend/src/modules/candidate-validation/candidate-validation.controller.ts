import { Body, Controller, Delete, Get, NotFoundException, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CandidateValidationService } from './candidate-validation.service';
import { AssessRequestDto, SaveValidationProfileDto } from './dto/save-validation-profile.dto';

@ApiTags('Candidate validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidate-validation')
export class CandidateValidationController {
  constructor(private readonly service: CandidateValidationService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the signed-in user's validation profile and latest assessment" })
  getMine(@CurrentUser('id') userId: string) {
    return this.service.getMine(userId);
  }

  @Put('profiles')
  @ApiOperation({ summary: 'Save public coding profiles, top project URL, and record assessment consent' })
  saveProfile(@CurrentUser('id') userId: string, @Body() dto: SaveValidationProfileDto) {
    return this.service.saveProfile(userId, dto);
  }

  @Delete('profiles')
  @ApiOperation({ summary: 'Withdraw consent and delete saved profiles and their assessments' })
  deleteProfile(@CurrentUser('id') userId: string) {
    return this.service.deleteProfile(userId);
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Assess public profile evidence and top project code quality for the signed-in user' })
  assess(@CurrentUser('id') userId: string, @Body() body?: AssessRequestDto) {
    return this.service.assess(userId, body?.topRepoUrl);
  }

  @Get('evaluations/download-json')
  @ApiOperation({ summary: 'Download the latest stored JSON evaluation data file' })
  downloadJson(@CurrentUser('id') userId: string, @Res() res: Response) {
    const file = this.service.getLatestEvaluationFile(userId);
    if (!file) {
      throw new NotFoundException('No evaluation JSON file found for current student. Please run an assessment first.');
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  }
}
