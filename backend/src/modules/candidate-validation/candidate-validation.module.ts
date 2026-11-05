import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CandidateValidationController } from './candidate-validation.controller';
import { CandidateValidationService } from './candidate-validation.service';

@Module({
  controllers: [CandidateValidationController],
  providers: [CandidateValidationService, JwtAuthGuard],
})
export class CandidateValidationModule {}
