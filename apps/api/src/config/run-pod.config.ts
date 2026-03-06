import { ConfigType, registerAs } from '@nestjs/config';

export const RunPodConfig = registerAs('runpod', () => {
  return {
    apiKey: process.env.RUNPOD_API_KEY,
    baseUrl: process.env.RUNPOD_BASE_URL,
    endpointId: process.env.RUNPOD_ENDPOINT_ID,
  };
});

export type RunPodConfig = ConfigType<typeof RunPodConfig>;
