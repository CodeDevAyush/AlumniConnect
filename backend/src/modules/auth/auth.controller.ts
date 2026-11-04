import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with credentials' })
  async login(@Body() body: any) {
    return { message: 'Authentication endpoint initialized' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new student or alumni account' })
  async register(@Body() body: any) {
    return { message: 'Registration endpoint initialized' };
  }
}
