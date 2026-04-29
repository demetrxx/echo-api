import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class VoiceTranscribeRequestDto {
  @ApiProperty({
    type: String,
    format: 'binary',
  })
  @IsObject()
  file: MultipartFile;
}
