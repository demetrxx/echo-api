import { BadRequestException, Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected } from '@/modules/auth';
import { LlmService } from '@/modules/llm';

import { VoiceTranscribeRequestDto } from './dtos';

@ApiTags('Services')
@Protected()
@Controller()
export class ServicesController {
  constructor(private readonly llmService: LlmService) {}

  @Post('voice/transcribe')
  async voiceToText(@Body() body: VoiceTranscribeRequestDto) {
    if (!body.file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('Only audio files are allowed');
    }

    const buffer = await body.file.toBuffer();

    const text = await this.llmService.voiceToText({
      buffer,
      name: body.file.filename,
      mime: body.file.mimetype,
    });

    return { text };
  }
}
