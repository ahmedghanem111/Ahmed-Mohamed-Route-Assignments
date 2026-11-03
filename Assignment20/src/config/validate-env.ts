const REQUIRED = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'ENCRYPTION_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'FRONTEND_URL',
  'RECAPTCHA_SECRET_KEY',
];

export function validateEnvironment(config: Record<string, unknown>) {
  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const placeholder = REQUIRED.find((key) =>
    /replace_with|change_me|example\.com/i.test(String(config[key])),
  );
  if (placeholder) throw new Error(`${placeholder} still contains an example placeholder`);

  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (typeof config[key] !== 'string' || config[key].length < 32) {
      throw new Error(`${key} must contain at least 32 characters`);
    }
  }
  if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }

  const encryptionKey = Buffer.from(String(config.ENCRYPTION_KEY), 'base64');
  if (encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }

  if (config.CAPTCHA_VERIFY_URL) {
    try {
      const captchaUrl = new URL(String(config.CAPTCHA_VERIFY_URL));
      if (captchaUrl.protocol !== 'https:') throw new Error();
    } catch {
      throw new Error('CAPTCHA_VERIFY_URL must be a valid HTTPS URL');
    }
  }

  const smtpPort = Number(config.SMTP_PORT);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port');
  }

  for (const key of ['JWT_ACCESS_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN']) {
    if (
      typeof config[key] !== 'string' ||
      !/^[1-9]\d*[smhd]$/.test(config[key] as string)
    ) {
      throw new Error(`${key} must use a duration such as 15m or 7d`);
    }
  }

  try {
    const databaseUrl = new URL(String(config.DATABASE_URL));
    const redisUrl = new URL(String(config.REDIS_URL));
    if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) throw new Error();
    if (!['redis:', 'rediss:'].includes(redisUrl.protocol)) throw new Error();
    const frontend = new URL(String(config.FRONTEND_URL));
    if (!['http:', 'https:'].includes(frontend.protocol)) throw new Error();
  } catch {
    throw new Error('DATABASE_URL, REDIS_URL, and FRONTEND_URL must be valid URLs');
  }

  return config;
}
