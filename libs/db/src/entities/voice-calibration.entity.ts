import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { NoteEntity } from './note.entity';
import { VoiceData, VoiceEntity } from './voice.entity';

export enum VoiceCalibrationType {
  Initial = 'initial',
  Feedback = 'feedback',
  UpdateExamples = 'updateExamples',
}

export interface VoiceCalibrationSample {
  theme: { name: string; description?: string };
  idea: { name: string; angle?: string };
  note?: string;
  text: string;
}

export interface VoiceCalibrationStep {
  type: VoiceCalibrationType;
  data: VoiceData;
  samples: VoiceCalibrationSample[];
  feedback: string;
}

export interface VoiceCalibrationData {
  steps: VoiceCalibrationStep[];
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

  @OneToOne(() => NoteEntity, { nullable: true })
  @JoinColumn({
    name: 'note_id',
    referencedColumnName: 'id',
  })
  note?: NoteEntity;

  @Column({
    type: 'uuid',
    name: 'note_id',
    nullable: true,
  })
  noteId?: string;
}
