import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { IdeaEntity } from './idea.entity';
import { ThemeEntity } from './theme.entity';

@Entity('idea_theme')
export class IdeaThemeEntity extends AbstractEntity {
  @ManyToOne(() => IdeaEntity, (idea) => idea.themes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'idea_id',
    referencedColumnName: 'id',
  })
  idea: IdeaEntity;

  @Index('idx_idea_theme_idea')
  @Column({
    type: 'uuid',
    name: 'idea_id',
  })
  ideaId: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.ideas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme: ThemeEntity;

  @Index('idx_idea_theme_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
  })
  themeId: string;
}
