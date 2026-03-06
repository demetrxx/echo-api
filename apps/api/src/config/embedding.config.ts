import { ConfigType, registerAs } from '@nestjs/config';

export const EmbeddingConfig = registerAs('embedding', () => {
  return {
    model: process.env.EMBED_MODEL ?? 'text-embedding-3-small',
    dim: Number.parseInt(process.env.EMBED_DIM ?? '1536', 10),
    batchSize: Number.parseInt(process.env.EMBED_BATCH_SIZE ?? '128', 10),
    maxTokens: Number.parseInt(process.env.EMBED_MAX_TOKENS ?? '8192', 10),
    minChars: Number.parseInt(process.env.EMBED_MIN_CHARS ?? '40', 10),
  };
});

export type EmbeddingConfig = ConfigType<typeof EmbeddingConfig>;
