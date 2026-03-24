import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Inject, Logger } from '@nestjs/common';
import { OpenAI, toFile } from 'openai';

import { EmbeddingConfig, LlmConfig } from '../../config';

export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly _client: ChatOpenAI;
  private readonly openai: OpenAI;
  private readonly _embeddings: OpenAIEmbeddings;
  private readonly _fastClient: ChatOpenAI;

  public get client(): ChatOpenAI {
    return this._client;
  }

  public get fastClient(): ChatOpenAI {
    return this._fastClient;
  }

  public get embeddings(): OpenAIEmbeddings {
    return this._embeddings;
  }

  constructor(
    @Inject(LlmConfig.KEY)
    private readonly config: LlmConfig,
    @Inject(EmbeddingConfig.KEY)
    private readonly embeddingConfig: EmbeddingConfig,
  ) {
    this._client = new ChatOpenAI({
      apiKey: this.config.apiKey,
      model: 'gpt-5.4',
    });

    this._fastClient = new ChatOpenAI({
      apiKey: this.config.apiKey,
      model: 'gpt-5-mini',
    });

    this._embeddings = new OpenAIEmbeddings({
      apiKey: this.config.apiKey,
      model: this.embeddingConfig.model,
    });

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async voiceToText(i: {
    buffer: Buffer;
    name: string;
    mime: string;
  }): Promise<string> {
    const { buffer, name, mime } = i;

    const response = await this.openai.audio.transcriptions.create({
      file: await toFile(buffer, name, { type: mime }),
      model: 'gpt-4o-mini-transcribe',
    });

    return response.text;
  }

  public async getEmbeddings(text: string) {
    return this.embeddings.embedQuery(text);
  }

  public async getTextLanguage(text: string): Promise<string> {
    const response = await this.fastClient.invoke(
      [
        {
          role: 'user',
          content: `Detect the language code of the following text: """${text}""", \n **return only the language code and nothing else**`,
        },
      ],
      {},
    );

    const langCode = (response.content as string).trim();

    // validate lang code
    if (!langCode.match(/^[a-z]{2}$/)) {
      return 'en';
    }

    return langCode;
  }
}
