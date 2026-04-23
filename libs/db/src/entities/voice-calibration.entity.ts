import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { VoiceData, VoiceEntity } from './voice.entity';

export enum VoiceCalibrationType {
  Initial = 'initial',
  Feedback = 'feedback',
  UpdateExamples = 'updateExamples',
}

export interface VoiceCalibrationStep {
  type: VoiceCalibrationType;
  data: VoiceData;
  samples: { theme: string; idea: string; note?: string; text: string }[];
  feedback: string;
}

export interface VoiceCalibrationData {
  steps: VoiceCalibrationStep[];
  themes: string[];
  ideas: string[];
  note: string | null;
}

@Entity('voice_calibration')
export class VoiceCalibrationEntity extends AbstractEntity {
  @OneToOne(() => VoiceEntity, (voice) => voice.calibration)
  @JoinColumn({
    name: 'voice_id',
    referencedColumnName: 'id',
  })
  voice: VoiceEntity;

  @Column({
    type: 'uuid',
    name: 'voice_id',
  })
  voiceId: string;

  @Column({
    type: 'jsonb',
  })
  data: VoiceCalibrationData;
}
