import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get profile by user ID' })
  async getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfileByUserId(userId);
  }
}
