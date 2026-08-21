import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';
import { QaCaseEntity } from './qa-case.entity';
import { QaIssueEntity } from './qa-issue.entity';
import { QaProfileEntity } from './qa-profile.entity';
import { QaReviewEntity } from './qa-review.entity';
import { QaSuiteEntity } from './qa-suite.entity';
import { QaSystemVersionEntity } from './qa-system-version.entity';

export enum QaRunKind {
  Atomic = 'atomic',
  Guided = 'guided',
}

export enum QaRunStatus {
  Draft = 'draft',
  Ready = 'ready',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum QaContextPolicy {
  Exact = 'exact',
  ProductDefaults = 'product_defaults',
}

export interface QaRunStepAttempt {
  id: string;
  input: Record<string, unknown>;
  resolvedContext: Record<string, unknown>;
  output: unknown | null;
  artifacts: Record<string, unknown>;
  error: { code: string; message: string; details?: unknown } | null;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface QaRunStepData {
  key: string;
  order: number;
  capabilityKey: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempts: QaRunStepAttempt[];
  selectedAttemptId: string | null;
  operatorSelection: unknown | null;
  nextActions: string[];
}

@Entity('qa_run')
export class QaRunEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: QaRunKind,
    enumName: 'qa_run_kind_enum',
  })
  kind: QaRunKind;

  @Column({
    type: 'enum',
    enum: QaRunStatus,
    enumName: 'qa_run_status_enum',
    default: QaRunStatus.Draft,
  })
  @Index('idx_qa_run_status')
  status: QaRunStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentStepKey: string | null;

  @Column({
    type: 'enum',
    enum: QaContextPolicy,
    enumName: 'qa_context_policy_enum',
    default: QaContextPolicy.ProductDefaults,
  })
  contextPolicy: QaContextPolicy;

  @Column({ type: 'jsonb', default: {} })
  profileSnapshot: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  systemVersionSnapshot: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  rubricSnapshot: unknown[];

  @Column({ type: 'jsonb', default: {} })
  resolvedContext: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  steps: QaRunStepData[];

  @Column({ type: 'jsonb', nullable: true })
  summary: Record<string, unknown> | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => QaProfileEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: QaProfileEntity | null;

  @Index('idx_qa_run_profile')
  @Column({ type: 'uuid', name: 'profile_id', nullable: true })
  profileId: string | null;

  @ManyToOne(() => QaCaseEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'case_id', referencedColumnName: 'id' })
  case: QaCaseEntity | null;

  @Index('idx_qa_run_case')
  @Column({ type: 'uuid', name: 'case_id', nullable: true })
  caseId: string | null;

  @ManyToOne(() => QaSuiteEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'suite_id', referencedColumnName: 'id' })
  suite: QaSuiteEntity | null;

  @Column({ type: 'uuid', name: 'suite_id', nullable: true })
  suiteId: string | null;

  @ManyToOne(() => QaSystemVersionEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'system_version_id', referencedColumnName: 'id' })
  systemVersion: QaSystemVersionEntity | null;

  @Index('idx_qa_run_system_version')
  @Column({ type: 'uuid', name: 'system_version_id', nullable: true })
  systemVersionId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'operator_user_id', referencedColumnName: 'id' })
  operatorUser: UserEntity | null;

  @Column({ type: 'uuid', name: 'operator_user_id', nullable: true })
  operatorUserId: string | null;

  @OneToMany(() => QaReviewEntity, (review) => review.run)
  reviews: QaReviewEntity[];

  @OneToMany(() => QaIssueEntity, (issue) => issue.run)
  issues: QaIssueEntity[];
}
