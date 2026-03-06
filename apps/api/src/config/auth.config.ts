import { ConfigType, registerAs } from '@nestjs/config';

export const AuthConfig = registerAs('auth', () => {
  const accessTtlMinutes = parseInt(
    process.env.AUTH_ACCESS_TTL_MIN ?? '15',
    10,
  );
  const refreshTtlDays = parseInt(
    process.env.AUTH_REFRESH_TTL_DAYS ?? '30',
    10,
  );

  return {
    emailAuthEnabled: process.env.AUTH_EMAIL_ENABLED === 'true',
    accessSecret: process.env.AUTH_ACCESS_SECRET ?? '',
    refreshSecret: process.env.AUTH_REFRESH_SECRET ?? '',
    accessTtlMinutes,
    refreshTtlDays,
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN ?? '.echohq.com',
    cookiePath: process.env.AUTH_COOKIE_PATH ?? '/auth',
    cookieSecure: process.env.AUTH_COOKIE_SECURE !== 'false',
    cookieSameSite: (process.env.AUTH_COOKIE_SAMESITE ?? 'lax').toLowerCase(),
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    skipEmailConfirm: process.env.AUTH_SKIP_EMAIL_CONFIRM === 'true',
    confirmEmailTtlHours: parseInt(
      process.env.AUTH_CONFIRM_EMAIL_TTL_HOURS ?? '24',
      10,
    ),
    resetPasswordTtlHours: parseInt(
      process.env.AUTH_RESET_PASSWORD_TTL_HOURS ?? '2',
      10,
    ),
    confirmEmailUrl:
      process.env.AUTH_CONFIRM_EMAIL_URL ??
      `${process.env.APP_URL ?? ''}/auth/confirm-email`,
    resetPasswordUrl:
      process.env.AUTH_RESET_PASSWORD_URL ??
      `${process.env.APP_URL ?? ''}/auth/reset-password`,
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    resendFrom: process.env.RESEND_FROM ?? '',
  };
});

export type AuthConfig = ConfigType<typeof AuthConfig>;
