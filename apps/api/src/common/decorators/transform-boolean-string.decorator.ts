import { Transform } from 'class-transformer';

export function TransformBooleanString() {
  return Transform(({ obj, key }) => obj[key] === 'true');
}
