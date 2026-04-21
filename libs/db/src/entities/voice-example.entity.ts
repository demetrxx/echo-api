import { Column, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { PlatformType } from './post.entity';
import { VoiceEntity } from './voice.entity';

export class VoiceExampleEntity extends AbstractEntity {
  // embedding of the text
  @Column({
    type: 'vector',
    length: 1536,
  })
  textEmbeddings: number[];

  @Column({
    type: 'text',
  })
  text: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
    enumName: 'platform_type_enum',
  })
  platform: PlatformType;

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
