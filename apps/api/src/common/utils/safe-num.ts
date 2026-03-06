export function safeNum(x?: number): number {
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}
