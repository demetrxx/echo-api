import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { VoiceEntity } from './voice.entity';

@Entity('voice_example')
export class VoiceExampleEntity extends AbstractEntity {
  @Column({
    type: 'vector',
    length: 1536,
  })
  textEmbeddings: number[];

  @Column({
    type: 'text',
  })
  text: string;

  @ManyToOne(() => VoiceEntity, (voice) => voice.examples)
  @JoinColumn({
    name: 'voice_id',
    referencedColumnName: 'id',
  })
  voice: VoiceEntity;

  @Index('idx_voice_example_voice')
  @Column({
    type: 'uuid',
    name: 'voice_id',
  })
  voiceId: string;
}
