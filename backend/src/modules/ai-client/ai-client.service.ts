import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface AlumniMatchRequest {
  studentId: string;
  skills: string[];
  interests: string[];
  targetRoles: string[];
  topK?: number;
}

export interface SkillGapAnalysisRequest {
  currentSkills: string[];
  targetRole: string;
}

export interface CodingAnalysisRequest {
  githubUsername: string;
  repositories?: string[];
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('internalApi.aiServiceUrl');
    const secretKey = this.configService.get<string>('internalApi.secretKey');

    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': secretKey,
      },
    });
  }

  async checkAiServiceHealth(): Promise<{ status: string; service: string }> {
    try {
      const response = await this.client.get('/api/v1/health');
      return response.data;
    } catch (error: any) {
      this.logger.error(`AI service health check failed: ${error.message}`);
      return { status: 'unreachable', service: 'fastapi-ai-service' };
    }
  }

  async matchAlumni(payload: AlumniMatchRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/matching/alumni', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`AI service matching request failed: ${error.message}`);
      throw error;
    }
  }

  async analyzeSkillGap(payload: SkillGapAnalysisRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/skills/gap-analysis', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`AI service skill gap analysis failed: ${error.message}`);
      throw error;
    }
  }

  async evaluateGithubProfile(payload: CodingAnalysisRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/coding/github-analysis', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`AI service GitHub evaluation failed: ${error.message}`);
      throw error;
    }
  }
}
