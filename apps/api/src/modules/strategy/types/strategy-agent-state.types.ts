import {
  ChatMessage,
  ProfileEntity,
  StrategySnapshot,
  StrategyStage,
  ThemeEntity,
} from '@app/db';

export interface StrategyAgentState {
  snapshot: StrategySnapshot;
  history: ChatMessage[];
  stage: StrategyStage;
  userMessage: string;

  themes: ThemeEntity[];
  voice: ProfileEntity | null;

  updates: {
    themesToLink: string[];
    themesToCreate: { name: string; description: string }[];
    themesToUpdate: { id: string; name?: string; description?: string }[];
    themesToRemove: string[];

    voiceToSet: string | null | undefined;
    voiceToCreate: { name: string; description: string } | null;
    voiceToUpdate: { name?: string; description?: string } | null;
  };
}
