import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { QaProfileEntity, QaProfileSegment } from './qa-profile.entity';

export enum QaCaseKind {
  Atomic = 'atomic',
  Guided = 'guided',
}

export enum QaCaseStatus {
  Active = 'active',
  Archived = 'archived',
}

@Entity('qa_case')
export class QaCaseEntity extends AbstractEntity {
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
    enum: QaCaseKind,
    enumName: 'qa_case_kind_enum',
  })
  kind: QaCaseKind;

  @Column({ type: 'jsonb', default: {} })
  definition: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  rubric: unknown[];

  @Column({
    type: 'enum',
    enum: QaCaseStatus,
    enumName: 'qa_case_status_enum',
    default: QaCaseStatus.Active,
  })
  status: QaCaseStatus;

  @ManyToOne(() => QaProfileEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: QaProfileEntity | null;

  @Index('idx_qa_case_profile')
  @Column({ type: 'uuid', name: 'profile_id', nullable: true })
  profileId: string | null;

  @Column({ type: 'uuid', name: 'created_from_run_id', nullable: true })
  createdFromRunId: string | null;
}
