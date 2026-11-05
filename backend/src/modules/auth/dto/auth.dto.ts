import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsIn([UserRole.STUDENT, UserRole.ALUMNI])
  role!: Extract<UserRole, 'STUDENT' | 'ALUMNI'>;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  graduationYear?: number;

  // Student profile fields
  @IsOptional()
  @IsString()
  githubUsername?: string;

  @IsOptional()
  @IsString()
  codingPlatform?: string;

  @IsOptional()
  @IsString()
  codingHandle?: string;

  @IsOptional()
  targetRoles?: string[];

  // Alumni profile fields
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  skills?: string[];

  @IsOptional()
  willingToMentor?: boolean;

  @IsOptional()
  willingToRefer?: boolean;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsIn([UserRole.STUDENT, UserRole.ALUMNI])
  role?: Extract<UserRole, 'STUDENT' | 'ALUMNI'>;
}
