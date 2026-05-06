import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .default(3001),

  DATABASE_URL: Joi.string()
    .required()
    .description('PostgreSQL connection string'),

  REDIS_URL: Joi.string()
    .default('redis://localhost:6379')
    .description('Redis connection string'),

  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret key (min 32 chars)'),

  JWT_ACCESS_EXPIRES_IN: Joi.number()
    .default(1800)
    .description('JWT access token expiry in seconds'),

  JWT_REFRESH_EXPIRES_IN: Joi.number()
    .default(604800)
    .description('JWT refresh token expiry in seconds'),

  ALLOWED_ORIGINS: Joi.string()
    .default('http://localhost:3000')
    .description('Comma-separated list of allowed CORS origins'),

  THROTTLE_TTL: Joi.number()
    .default(60000)
    .description('Rate limit window in milliseconds'),

  THROTTLE_LIMIT: Joi.number()
    .default(100)
    .description('Rate limit max requests per window'),

  MAX_FILE_SIZE: Joi.number()
    .default(10485760)
    .description('Max file upload size in bytes'),

  UPLOAD_DIR: Joi.string()
    .default('./uploads')
    .description('Directory for file uploads'),
});
