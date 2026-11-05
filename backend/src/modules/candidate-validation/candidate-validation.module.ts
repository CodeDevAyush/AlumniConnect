import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiClientModule } from '../ai-client/ai-client.module';
import { ProjectEvalModule } from '../project-eval/project-eval.module';
import { CandidateValidationController } from './candidate-validation.controller';
import { CandidateValidationService } from './candidate-validation.service';

@Module({
  imports: [AiClientModule, ProjectEvalModule],
  controllers: [CandidateValidationController],
  providers: [CandidateValidationService, JwtAuthGuard],
  exports: [CandidateValidationService],
})
export class CandidateValidationModule {}
