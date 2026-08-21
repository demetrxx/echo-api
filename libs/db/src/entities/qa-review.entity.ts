import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { UserEntity } from './user.entity';
import { QaRunEntity } from './qa-run.entity';

export enum QaReviewerType {
  Ai = 'ai',
  Human = 'human',
}

@Entity('qa_review')
@Check(`"overall_score" >= 1 AND "overall_score" <= 10`)
export class QaReviewEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: QaReviewerType,
    enumName: 'qa_reviewer_type_enum',
  })
  reviewerType: QaReviewerType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stepKey: string | null;

  @Column({ type: 'int', name: 'overall_score' })
  overallScore: number;

  @Column({ type: 'jsonb', default: [] })
  criteria: unknown[];

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ManyToOne(() => QaRunEntity, (run) => run.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id', referencedColumnName: 'id' })
  run: QaRunEntity;

  @Index('idx_qa_review_run')
  @Column({ type: 'uuid', name: 'run_id' })
  runId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewer_user_id', referencedColumnName: 'id' })
  reviewerUser: UserEntity | null;

  @Column({ type: 'uuid', name: 'reviewer_user_id', nullable: true })
  reviewerUserId: string | null;
}
