import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-internal-api-key'] as string;
    const expectedKey = this.configService.get<string>('internalApi.secretKey');

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing internal service API key');
    }

    return true;
  }
}
