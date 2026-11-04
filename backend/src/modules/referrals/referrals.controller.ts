import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('alumni')
  @ApiOperation({ summary: 'Find alumni willing to refer candidates' })
  @ApiQuery({ name: 'company', required: false })
  async getReferralAlumni(@Query('company') company?: string) {
    return this.referralsService.getWillingAlumni(company);
  }
}
