import { StrategySnapshot } from '@app/db';

export const STRATEGY_SNAPSHOT_DEFAULT: StrategySnapshot = {
  audience: '',
  problems: [],
  goals: [],
  notes: [],
  platforms: [],
  platformNotes: {},
  unresolvedQuestions: [],
  voiceAdjustments: [],
  context: {},
};
