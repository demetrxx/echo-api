import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { IdeaEntity } from './idea.entity';
import { PlatformType, PostEntity } from './post.entity';
import { StrategyEntity } from './strategy.entity';
import { UserEntity } from './user.entity';
import { VoiceExampleEntity } from './voice-example.entity';

interface PlatformOverride {
  tov?: string[];
  rules?: string[];
  avoidRules?: string[];
  evidencePreferences?: string[];
}

type PlatformOverrides = Partial<Record<PlatformType, PlatformOverride>>;

@Entity('voice')
export class VoiceEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'jsonb',
  })
  rules: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  avoidRules: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  tov: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  evidencePreferences: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
    array: true,
    enumName: 'platform_type_enum',
    default: [],
  })
  platforms: PlatformType[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  platformOverrides: PlatformOverrides;

  // relations

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
