import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum IdeaStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
}

@Entity('idea')
export class IdeaEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  angle?: string;
}
