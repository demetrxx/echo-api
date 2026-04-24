import { PlatformType, VoiceData } from '@app/db';

export interface VoiceInfoDto {
  data: VoiceData;
  examples?: string[];
  platforms?: PlatformType[];
}
