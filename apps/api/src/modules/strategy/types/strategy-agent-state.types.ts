import {
  ChatMessage,
  StrategySnapshot,
  StrategyStage,
  ThemeEntity,
  VoiceEntity,
} from '@app/db';

interface CreateStrategyVoiceDto {
  name: string;
  description: string;
  rules: string[];
  avoidRules: string[];
  tov: string;
  evidencePreferences: string;
  anglePreferences: string;
}

type UpdateStrategyVoiceDto = Partial<CreateStrategyVoiceDto>;

export interface StrategyAgentState {
  name: string;
  snapshot: StrategySnapshot;
  history: ChatMessage[];
  stage: StrategyStage;
  userMessage: string;

  themes: ThemeEntity[];
  voice: VoiceEntity | null;

  userId: string;

  updates: {
    themesToLink: string[];
    themesToCreate: { name: string; description: string }[];
    themesToUpdate: { id: string; name?: string; description?: string }[];
    themesToRemove: string[];

    voiceToSet: string | null | undefined;
    voiceToCreate: CreateStrategyVoiceDto | null;
    voiceToUpdate: UpdateStrategyVoiceDto | null;
  };
}
