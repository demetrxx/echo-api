import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AppError } from '@/common/errors/app-error';
import { IdeaService } from '@/modules/idea';
import { PostService } from '@/modules/post';
import { StrategyService } from '@/modules/strategy';
import { VoiceCalibrationService, VoiceService } from '@/modules/voice';

import {
  QaCapabilityCatalogItem,
  validateCapabilityRegistry,
} from '../types';
import { ideasSuggestCapability } from './capabilities/ideas.suggest';
import { postCreateCapability } from './capabilities/post.create';
import { postRefineCapability } from './capabilities/post.refine';
import { strategyCreateCapability } from './capabilities/strategy.create';
import { strategyMessageCapability } from './capabilities/strategy.message';
import { voiceAdaptTextCapability } from './capabilities/voice.adapt-text';
import { voiceCalibrationFeedbackCapability } from './capabilities/voice.calibration-feedback';
import { voiceCalibrationStartCapability } from './capabilities/voice.calibration-start';
import {
  QaCapabilityDefinition,
  QaCapabilityServices,
} from './qa-capability.types';

const CAPABILITIES: QaCapabilityDefinition[] = [
  ideasSuggestCapability,
  postCreateCapability,
  postRefineCapability,
  strategyCreateCapability,
  strategyMessageCapability,
  voiceAdaptTextCapability,
  voiceCalibrationStartCapability,
  voiceCalibrationFeedbackCapability,
];

@Injectable()
export class QaCapabilityRegistry {
  private readonly byKey = new Map<string, QaCapabilityDefinition>();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly ideaService: IdeaService,
    private readonly postService: PostService,
    private readonly strategyService: StrategyService,
    private readonly voiceService: VoiceService,
    private readonly voiceCalibrationService: VoiceCalibrationService,
  ) {
    const catalog = CAPABILITIES.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      status: item.status,
      defaultRubric: item.defaultRubric,
      allowedNext: item.allowedNext,
    }));

    validateCapabilityRegistry(catalog);

    for (const capability of CAPABILITIES) {
      this.byKey.set(capability.key, capability);
    }
  }

  listCatalog(): {
    capabilities: QaCapabilityCatalogItem[];
  } {
    return {
      capabilities: CAPABILITIES.map((item) => ({
        key: item.key,
        label: item.label,
        description: item.description,
        status: item.status,
        defaultRubric: item.defaultRubric,
        allowedNext: item.allowedNext,
      })),
    };
  }

  get(key: string): QaCapabilityDefinition {
    const capability = this.byKey.get(key);
    if (!capability) {
      throw new AppError(
        'QA_CAPABILITY_UNKNOWN',
        `Unknown capability: ${key}`,
        { key },
      );
    }
    return capability;
  }

  services(): QaCapabilityServices {
    return {
      dataSource: this.dataSource,
      ideaService: this.ideaService,
      postService: this.postService,
      strategyService: this.strategyService,
      voiceService: this.voiceService,
      voiceCalibrationService: this.voiceCalibrationService,
    };
  }
}
