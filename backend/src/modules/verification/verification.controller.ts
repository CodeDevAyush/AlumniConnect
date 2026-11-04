import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VerificationService } from './verification.service';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending verification requests' })
  async getPending() {
    return this.verificationService.getPendingRequests();
  }
}
