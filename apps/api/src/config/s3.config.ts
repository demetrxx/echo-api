import { ConfigType, registerAs } from '@nestjs/config';

export const S3Config = registerAs('s3', () => {
  return {
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
  };
});

export type S3Config = ConfigType<typeof S3Config>;
