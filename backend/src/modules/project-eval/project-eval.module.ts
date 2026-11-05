import { Module } from '@nestjs/common';
import { ProjectEvalController } from './project-eval.controller';
import { ProjectEvalService } from './project-eval.service';

@Module({
  controllers: [ProjectEvalController],
  providers: [ProjectEvalService],
  exports: [ProjectEvalService],
})
export class ProjectEvalModule {}
