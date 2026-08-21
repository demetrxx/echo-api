import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum QaSystemVersionRole {
  Baseline = 'baseline',
  Candidate = 'candidate',
  Archived = 'archived',
}

@Entity('qa_system_version')
export class QaSystemVersionEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: QaSystemVersionRole,
    enumName: 'qa_system_version_role_enum',
    default: QaSystemVersionRole.Candidate,
  })
  role: QaSystemVersionRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  codeRevision: string | null;

  @Column({ type: 'boolean', default: false })
  isDirty: boolean;

  @Column({ type: 'jsonb', default: {} })
  models: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  prompts: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  runtime: Record<string, unknown>;
}
