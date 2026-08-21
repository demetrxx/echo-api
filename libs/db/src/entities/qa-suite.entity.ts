import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { QaProfileSegment } from './qa-profile.entity';
import { QaSystemVersionEntity } from './qa-system-version.entity';

export enum QaSuiteStatus {
  Active = 'active',
  Archived = 'archived',
}

@Entity('qa_suite')
export class QaSuiteEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: QaProfileSegment,
    enumName: 'qa_profile_segment_enum',
  })
  segment: QaProfileSegment;

  @Column({ type: 'jsonb', default: [] })
  caseIds: string[];

  @Column({ type: 'jsonb', default: {} })
  defaultRubrics: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: QaSuiteStatus,
    enumName: 'qa_suite_status_enum',
    default: QaSuiteStatus.Active,
  })
  status: QaSuiteStatus;

  @ManyToOne(() => QaSystemVersionEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'baseline_system_version_id',
    referencedColumnName: 'id',
  })
  baselineSystemVersion: QaSystemVersionEntity | null;

  @Index('idx_qa_suite_baseline_version')
  @Column({ type: 'uuid', name: 'baseline_system_version_id', nullable: true })
  baselineSystemVersionId: string | null;
}
