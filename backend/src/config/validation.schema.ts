import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().default(4000),
  API_PREFIX: Joi.string().default('api/v1'),
  PROTOTYPE_IN_MEMORY: Joi.boolean()
    .default(false)
    .when('NODE_ENV', {
      is: Joi.valid('development', 'test'),
      then: Joi.boolean(),
      otherwise: Joi.valid(false),
    }),
  DATABASE_URL: Joi.string().when('PROTOTYPE_IN_MEMORY', {
    is: true,
    then: Joi.string().allow('').optional(),
    otherwise: Joi.required(),
  }),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  INTERNAL_API_SECRET_KEY: Joi.string().min(16).required(),
  AI_SERVICE_URL: Joi.string().uri().default('http://localhost:8000'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
});
