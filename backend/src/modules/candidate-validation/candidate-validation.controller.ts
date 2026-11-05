import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CandidateValidationService } from './candidate-validation.service';
import { SaveValidationProfileDto } from './dto/save-validation-profile.dto';

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
  @ApiOperation({ summary: 'Save public coding profiles and record assessment consent' })
  saveProfile(@CurrentUser('id') userId: string, @Body() dto: SaveValidationProfileDto) {
    return this.service.saveProfile(userId, dto);
  }

  @Delete('profiles')
  @ApiOperation({ summary: 'Withdraw consent and delete saved profiles and their assessments' })
  deleteProfile(@CurrentUser('id') userId: string) {
    return this.service.deleteProfile(userId);
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Assess available public profile evidence for the signed-in user' })
  assess(@CurrentUser('id') userId: string) {
    return this.service.assess(userId);
  }
}
