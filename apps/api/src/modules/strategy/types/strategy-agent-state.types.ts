import {
  ChatMessage,
  ProfileEntity,
  StrategySnapshot,
  StrategyStage,
  ThemeEntity,
} from '@app/db';

interface CreateStrategyProfileDto {
  name: string;
  description: string;
  rules: string[];
  avoidRules: string[];
  tov: string;
  evidencePreferences: string;
  anglePreferences: string;
}

type UpdateStrategyProfileDto = Partial<CreateStrategyProfileDto>;

export interface StrategyAgentState {
  name: string;
  snapshot: StrategySnapshot;
  history: ChatMessage[];
  stage: StrategyStage;
  userMessage: string;

  themes: ThemeEntity[];
  profile: ProfileEntity | null;

  userId: string;

  updates: {
    themesToLink: string[];
    themesToCreate: { name: string; description: string }[];
    themesToUpdate: { id: string; name?: string; description?: string }[];
    themesToRemove: string[];

    profileToSet: string | null | undefined;
    profileToCreate: CreateStrategyProfileDto | null;
    profileToUpdate: UpdateStrategyProfileDto | null;
  };
}
