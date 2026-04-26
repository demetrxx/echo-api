import { IdeaEntity } from '@app/db';

import { inTag } from '@/common/utils';

export function injectIdea(idea?: IdeaEntity) {
  if (!idea) return ``;
  return inTag(
    'idea',
    JSON.stringify(
      {
        name: idea.name,
        angle: idea.angle,
      },
      null,
      2,
    ),
  );
}
