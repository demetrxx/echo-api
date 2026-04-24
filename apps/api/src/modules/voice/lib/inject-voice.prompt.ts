import { inTag } from '@/common/utils/prompt';

import { VoiceInfoDto } from '../types/voice-info.dto';

export function injectVoice(info?: VoiceInfoDto) {
  if (!info) return '';

  return (
    'Current Voice:\n' + inTag('voice', `${JSON.stringify(info.data, null, 2)}`)
  );
}
