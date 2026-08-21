import { ConfigType, registerAs } from '@nestjs/config';

export const QaConfig = registerAs('qa', () => {
  const emails = (process.env.QA_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return {
    adminEmails: emails,
  };
});

export type QaConfig = ConfigType<typeof QaConfig>;
