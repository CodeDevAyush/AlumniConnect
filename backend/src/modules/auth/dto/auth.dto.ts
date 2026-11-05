import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @IsIn([UserRole.STUDENT, UserRole.ALUMNI])
  role!: Extract<UserRole, 'STUDENT' | 'ALUMNI'>;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}
