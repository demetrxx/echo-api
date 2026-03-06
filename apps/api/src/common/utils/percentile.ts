/**
 * Calculate the percentile of a list of numbers.
 * @param values
 * @param quantile
 */
export function percentile(values: number[], quantile: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(sorted.length * quantile) - 1),
  );
  return sorted[index];
}
