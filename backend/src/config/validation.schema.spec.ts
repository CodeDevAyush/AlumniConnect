import { configValidationSchema } from './validation.schema';

const requiredSecrets = {
  JWT_ACCESS_SECRET: 'prototype-access-secret-at-least-16',
  JWT_REFRESH_SECRET: 'prototype-refresh-secret-at-least-16',
  INTERNAL_API_SECRET_KEY: 'prototype-internal-secret-at-least-16',
};

describe('configValidationSchema prototype mode', () => {
  it('allows local in-memory development without DATABASE_URL', () => {
    const { error } = configValidationSchema.validate({
      NODE_ENV: 'development',
      PROTOTYPE_IN_MEMORY: true,
      ...requiredSecrets,
    });

    expect(error).toBeUndefined();
  });

  it('still requires DATABASE_URL when in-memory mode is disabled', () => {
    const { error } = configValidationSchema.validate({
      NODE_ENV: 'development',
      PROTOTYPE_IN_MEMORY: false,
      ...requiredSecrets,
    });

    expect(error?.details.some((detail) => detail.path[0] === 'DATABASE_URL')).toBe(true);
  });

  it.each(['staging', 'production'])('does not allow in-memory mode in %s', (environment) => {
    const { error } = configValidationSchema.validate({
      NODE_ENV: environment,
      PROTOTYPE_IN_MEMORY: true,
      ...requiredSecrets,
    });

    expect(error?.details.some((detail) => detail.path[0] === 'PROTOTYPE_IN_MEMORY')).toBe(true);
  });
});
