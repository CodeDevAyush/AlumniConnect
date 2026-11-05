export default () => ({
  environment: process.env.NODE_ENV || 'development',
  prototype: {
    inMemory: process.env.PROTOTYPE_IN_MEMORY === 'true',
  },
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      'dev_jwt_access_secret_change_in_production_min_32_bytes_long',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'dev_jwt_refresh_secret_change_in_production_min_32_bytes_long',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  internalApi: {
    secretKey:
      process.env.INTERNAL_API_SECRET_KEY ||
      'dev_internal_shared_secret_between_backend_and_ai_service_32b',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },
});
