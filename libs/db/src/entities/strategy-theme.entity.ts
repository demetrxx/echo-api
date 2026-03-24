import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { StrategyEntity } from './strategy.entity';
import { ThemeEntity } from './theme.entity';

@Entity('strategy_theme')
export class StrategyThemeEntity extends AbstractEntity {
  @ManyToOne(() => StrategyEntity, (strategy) => strategy.themes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'strategy_id',
    referencedColumnName: 'id',
  })
  strategy: StrategyEntity;

  @Index('idx_strategy_theme_strategy')
  @Column({
    type: 'uuid',
    name: 'strategy_id',
  })
  strategyId: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.strategies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'theme_id',
    referencedColumnName: 'id',
  })
  theme: ThemeEntity;

  @Index('idx_strategy_theme_theme')
  @Column({
    type: 'uuid',
    name: 'theme_id',
  })
  themeId: string;
}
