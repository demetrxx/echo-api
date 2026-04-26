import { StrategyEntity } from '@app/db';

import { inTag } from '@/common/utils';

export function injectStrategy(strategy?: StrategyEntity) {
  if (!strategy) return ``;
  return inTag('strategy', JSON.stringify(strategy.snapshot, null, 2));
}
