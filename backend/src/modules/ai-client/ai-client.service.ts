import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface StudentEvidencePayload {
  studentId: string;
  selectedTrack?: string;
  leetcodeUsername?: string;
  codeforcesHandle?: string;
  githubUsername?: string;
  selfReportedSkills?: string[];
  internalAssessments?: Array<{ subject: string; score: number }>;
  manualProjects?: Array<{ title: string; techStack: string[]; description?: string }>;
}

export interface JobDescriptionAnalysisRequest {
  jobDescriptionText: string;
  targetRole?: string;
  studentId?: string;
  studentSkills?: string[];
}

export interface ProjectSubmissionPayload {
  title: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  liveDemoUrl?: string;
  architectureOverview?: string;
  keyFeatures?: string[];
}

export interface AlumniMatchRequest {
  studentId: string;
  skills: string[];
  interests: string[];
  targetRoles: string[];
  topK?: number;
}

export interface CareerGuidanceRequest {
  studentId: string;
  skills: string[];
  targetRole: string;
  currentYear?: number;
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('internalApi.aiServiceUrl', 'http://localhost:8000');
    const secretKey = this.configService.get<string>(
      'internalApi.secretKey',
      'dev_internal_shared_secret_between_backend_and_ai_service_32b',
    );

    this.client = axios.create({
      baseURL,
      timeout: 20000,
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

  async getAvailableTracks(): Promise<any> {
    const response = await this.client.get('/api/v1/capability/tracks');
    return response.data;
  }

  async assessStudentCapability(payload: StudentEvidencePayload): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/capability/assess', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Capability assessment failed: ${error.message}`);
      throw error;
    }
  }

  async analyzeSkillGap(payload: JobDescriptionAnalysisRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/skills/gap-analysis', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Skill gap analysis failed: ${error.message}`);
      throw error;
    }
  }

  async extractJobDescriptionSkills(jdText: string): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/skills/extract-jd', { jd_text: jdText });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Job description extraction failed: ${error.message}`);
      throw error;
    }
  }

  async analyzeCodingProfiles(payload: { studentId?: string; leetcodeUsername?: string; codeforcesHandle?: string }): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/coding/analyze', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Coding profile analysis failed: ${error.message}`);
      throw error;
    }
  }

  async evaluateGithubUser(username: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/v1/github/evaluate/${encodeURIComponent(username)}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`GitHub profile evaluation failed: ${error.message}`);
      throw error;
    }
  }

  async evaluateProjectSubmission(payload: ProjectSubmissionPayload): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/projects/evaluate', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Project evaluation failed: ${error.message}`);
      throw error;
    }
  }

  async matchAlumni(payload: AlumniMatchRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/matching/alumni', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Alumni matching failed: ${error.message}`);
      throw error;
    }
  }

  async getCareerGuidance(payload: CareerGuidanceRequest): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/recommendations/career', payload);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Career guidance request failed: ${error.message}`);
      throw error;
    }
  }
}
