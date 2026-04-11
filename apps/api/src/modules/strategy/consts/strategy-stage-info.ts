import { StrategyStage } from '@app/db';

interface StrategyStageInfo {
  name: StrategyStage;
  description: string;
  goal: string;
  escalationTrigger: string;
  guardrails: string[];
}

export const STRATEGY_STAGES: Record<StrategyStage, StrategyStageInfo> = {
  [StrategyStage.Diagnose]: {
    name: StrategyStage.Diagnose,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.Context]: {
    name: StrategyStage.Context,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.Direction]: {
    name: StrategyStage.Direction,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.Themes]: {
    name: StrategyStage.Themes,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.Voice]: {
    name: StrategyStage.Voice,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.Sharpen]: {
    name: StrategyStage.Sharpen,
    description: '',
    goal: '',
    escalationTrigger: '',
    guardrails: [],
  },
  [StrategyStage.FreeRefine]: {
    name: StrategyStage.FreeRefine,
    description: '',
    goal: '',
    escalationTrigger: 'None',
    guardrails: [],
  },
};
