import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('Opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active job and internship opportunities' })
  async listActive() {
    return this.opportunitiesService.listActive();
  }
}
