import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PlatformType } from '../common/platform';
import { IdeaEntity } from './idea.entity';
import { PostEntity } from './post.entity';
import { StrategyEntity } from './strategy.entity';
import { UserEntity } from './user.entity';
import { VoiceCalibrationEntity } from './voice-calibration.entity';
import { VoiceExampleEntity } from './voice-example.entity';

export enum VoiceStatus {
  Calibrating = 'calibrating',
  Active = 'active',
}

export interface VoiceData {
  tov: string[];
  rules: string[];
  avoidRules: string[];
  evidencePreferences: string;
  extra: Record<string, string>;
}

@Entity('voice')
export class VoiceEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: VoiceStatus,
    default: VoiceStatus.Calibrating,
  })
  status: VoiceStatus;

  @Column({
    type: 'jsonb',
  })
  data: VoiceData;

  @Column({
    type: 'enum',
    enum: PlatformType,
    array: true,
    enumName: 'platform_type_enum',
    default: [],
  })
  platforms: PlatformType[];

  // relations

  @OneToOne(() => VoiceCalibrationEntity, (calibration) => calibration.voice)
  calibration: VoiceCalibrationEntity;

  @ManyToOne(() => UserEntity, (user) => user.voices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_voice_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @OneToMany(() => PostEntity, (post) => post.voice)
  posts: PostEntity[];

  @OneToMany(() => StrategyEntity, (strategy) => strategy.voice)
  strategies: StrategyEntity[];

  @OneToMany(() => IdeaEntity, (idea) => idea.voice)
  ideas: IdeaEntity[];

  @OneToMany(() => VoiceExampleEntity, (example) => example.voice)
  examples: VoiceExampleEntity[];
}
