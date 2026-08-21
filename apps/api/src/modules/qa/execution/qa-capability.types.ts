import { DataSource } from 'typeorm';

import { IdeaService } from '@/modules/idea';
import { PostService } from '@/modules/post';
import { StrategyService } from '@/modules/strategy';
import { VoiceCalibrationService, VoiceService } from '@/modules/voice';

import {
  QaCapabilityStatus,
  QaContextItem,
  QaContextWarning,
  QaExecutorResult,
  QaRubricCriterion,
} from '../types';

export interface QaCapabilityServices {
  dataSource: DataSource;
  ideaService: IdeaService;
  postService: PostService;
  strategyService: StrategyService;
  voiceService: VoiceService;
  voiceCalibrationService: VoiceCalibrationService;
}

export interface QaResolvedCapabilityContext {
  input: Record<string, unknown>;
  context: QaContextItem[];
  warnings: QaContextWarning[];
}

export interface QaCapabilityDefinition {
  key: string;
  label: string;
  description: string;
  status: QaCapabilityStatus;
  defaultRubric: QaRubricCriterion[];
  allowedNext: string[];
  parseInput: (input: Record<string, unknown>) => Record<string, unknown>;
  resolveContext: (args: {
    sandboxUserId: string;
    input: Record<string, unknown>;
    services: QaCapabilityServices;
  }) => Promise<QaResolvedCapabilityContext>;
  execute: (args: {
    sandboxUserId: string;
    input: Record<string, unknown>;
    services: QaCapabilityServices;
  }) => Promise<QaExecutorResult>;
}
