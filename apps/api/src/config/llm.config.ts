import { ConfigType, registerAs } from '@nestjs/config';

export const LlmConfig = registerAs('llm', () => {
  return {
    apiKey: process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL,
  };
});

export type LlmConfig = ConfigType<typeof LlmConfig>;
