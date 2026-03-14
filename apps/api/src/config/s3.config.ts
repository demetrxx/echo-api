import { ConfigType, registerAs } from '@nestjs/config';

export const S3Config = registerAs('s3', () => {
  return {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL,
  };
});

export type S3Config = ConfigType<typeof S3Config>;
