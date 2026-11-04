export interface ApiResponseMeta {
  timestamp: string;
  path: string;
  version: string;
  page?: number;
  limit?: number;
  total?: number;
}

export class ApiResponseDto<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta: ApiResponseMeta;

  constructor(data: T, message?: string, statusCode = 200, metaOptions?: Partial<ApiResponseMeta>) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = {
      timestamp: new Date().toISOString(),
      path: metaOptions?.path || '',
      version: 'v1',
      ...metaOptions,
    };
  }
}
