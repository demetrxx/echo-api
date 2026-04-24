import { inTag } from '@/common/utils';

export function injectExamples(examples: string[]) {
  return (
    'User posts examples:\n' +
    inTag('examples', `${examples.map((e) => inTag('example', e)).join('\n')}`)
  );
}
