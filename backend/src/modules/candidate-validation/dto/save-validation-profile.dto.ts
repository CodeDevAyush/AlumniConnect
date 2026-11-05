import { CodingPlatform } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class SaveValidationProfileDto {
  @IsString()
  @MaxLength(39)
  @Matches(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/)
  githubUsername!: string;

  @IsOptional()
  @IsString()
  topRepoUrl?: string;

  @IsEnum(CodingPlatform)
  codingPlatform!: CodingPlatform;

  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9_-]+$/)
  codingHandle!: string;

  @IsBoolean()
  consent!: boolean;
}

export class AssessRequestDto {
  @IsOptional()
  @IsString()
  topRepoUrl?: string;
}
