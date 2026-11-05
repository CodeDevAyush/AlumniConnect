import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectEvalService } from './project-eval.service';
import { EvalRequestDto } from './dto/eval-request.dto';
import { EvalResultDto } from './dto/eval-result.dto';

@ApiTags('Project Code Quality Evaluation')
@Controller('project-eval')
export class ProjectEvalController {
  constructor(private readonly evalService: ProjectEvalService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate Top GitHub Project for Development Performance & Code Quality (SonarQube + Semgrep)',
  })
  @ApiResponse({ status: 200, type: EvalResultDto })
  async evaluate(@Body() dto: EvalRequestDto): Promise<EvalResultDto> {
    return this.evalService.evaluate(dto);
  }
}
