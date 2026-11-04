import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta: {
    timestamp: string;
    path: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data is already structured as an ApiResponseDto, don't double wrap
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }

        return {
          success: true,
          statusCode: response.statusCode || 200,
          data: data !== undefined ? data : null,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            version: 'v1',
          },
        };
      }),
    );
  }
}
