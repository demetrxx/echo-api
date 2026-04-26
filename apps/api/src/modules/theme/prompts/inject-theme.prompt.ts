import { ThemeEntity } from '@app/db';

import { inTag } from '@/common/utils';

export function injectTheme(theme?: ThemeEntity) {
  if (!theme) return ``;

  return inTag(
    'theme',
    JSON.stringify(
      {
        name: theme.name,
        description: theme.description,
      },
      null,
      2,
    ),
  );
}
