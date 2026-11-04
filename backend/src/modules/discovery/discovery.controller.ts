import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';

@ApiTags('Discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('alumni')
  @ApiOperation({ summary: 'Discover and search alumni by department or company' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'company', required: false })
  async searchAlumni(
    @Query('department') department?: string,
    @Query('company') company?: string,
  ) {
    return this.discoveryService.searchAlumni({ department, company });
  }
}
