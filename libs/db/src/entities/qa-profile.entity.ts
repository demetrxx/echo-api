import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';

export enum QaProfileSegment {
  FounderOperator = 'founder_operator',
  ExpertEducator = 'expert_educator',
  ReflectiveWriter = 'reflective_writer',
  Custom = 'custom',
  Clone = 'clone',
}

export enum QaProfileSource {
  AiGenerated = 'ai_generated',
  FixtureImport = 'fixture_import',
  RealClone = 'real_clone',
}

export enum QaProfileStatus {
  Draft = 'draft',
  Materializing = 'materializing',
  Ready = 'ready',
  OutOfDate = 'out_of_date',
  Failed = 'failed',
  Archived = 'archived',
}

export interface QaProfileDefinition {
  profile?: Record<string, unknown>;
  goals?: string[];
  pillars?: string[];
  toneRules?: string[];
  strategyState?: string[] | Record<string, unknown>;
  notes?: {
    raw?: string[];
    noisy?: string[];
  };
  postSamples?: Array<{ id?: string; text: string }>;
  expectedTasks?: unknown[];
  [extension: string]: unknown;
}

@Entity('qa_profile')
export class QaProfileEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: QaProfileSegment,
    enumName: 'qa_profile_segment_enum',
  })
  segment: QaProfileSegment;

  @Column({
    type: 'enum',
    enum: QaProfileSource,
    enumName: 'qa_profile_source_enum',
  })
  source: QaProfileSource;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fixtureKey: string | null;

  @Column({ type: 'jsonb', default: {} })
  definition: QaProfileDefinition;

  @Column({ type: 'int', default: 0 })
  draftRevision: number;

  @Column({
    type: 'enum',
    enum: QaProfileStatus,
    enumName: 'qa_profile_status_enum',
    default: QaProfileStatus.Draft,
  })
  status: QaProfileStatus;

  @Column({ type: 'text', nullable: true })
  materializationError: string | null;

  @Column({ type: 'timestamp', nullable: true })
  materializedAt: Date | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sandbox_user_id', referencedColumnName: 'id' })
  sandboxUser: UserEntity | null;

  @Index('idx_qa_profile_sandbox_user')
  @Column({ type: 'uuid', name: 'sandbox_user_id', nullable: true })
  sandboxUserId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_user_id', referencedColumnName: 'id' })
  sourceUser: UserEntity | null;

  @Index('idx_qa_profile_source_user')
  @Column({ type: 'uuid', name: 'source_user_id', nullable: true })
  sourceUserId: string | null;
}
