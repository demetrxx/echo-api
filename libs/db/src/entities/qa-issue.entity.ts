import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';
import { QaRunEntity } from './qa-run.entity';

export enum QaIssueSeverity {
  Minor = 'minor',
  Major = 'major',
  Critical = 'critical',
}

export enum QaIssueStatus {
  Open = 'open',
  Fixed = 'fixed',
  Ignored = 'ignored',
}

@Entity('qa_issue')
export class QaIssueEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255 })
  capabilityKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepKey: string | null;

  @Column({
    type: 'enum',
    enum: QaIssueSeverity,
    enumName: 'qa_issue_severity_enum',
    default: QaIssueSeverity.Major,
  })
  severity: QaIssueSeverity;

  @Column({
    type: 'enum',
    enum: QaIssueStatus,
    enumName: 'qa_issue_status_enum',
    default: QaIssueStatus.Open,
  })
  @Index('idx_qa_issue_status')
  status: QaIssueStatus;

  @ManyToOne(() => QaRunEntity, (run) => run.issues, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'run_id', referencedColumnName: 'id' })
  run: QaRunEntity | null;

  @Index('idx_qa_issue_run')
  @Column({ type: 'uuid', name: 'run_id', nullable: true })
  runId: string | null;

  @ManyToOne(() => QaRunEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resolution_run_id', referencedColumnName: 'id' })
  resolutionRun: QaRunEntity | null;

  @Column({ type: 'uuid', name: 'resolution_run_id', nullable: true })
  resolutionRunId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_user_id', referencedColumnName: 'id' })
  createdByUser: UserEntity | null;

  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  createdByUserId: string | null;
}
