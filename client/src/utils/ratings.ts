/** Approximates a 10-bucket (½ to 5 stars) rating distribution centred on the film's average. */
export function ratingDistribution(average: number): number[] {
  const raw = Array.from({ length: 10 }, (_, i) => {
    const rating = (i + 1) / 2;
    return Math.exp(-((rating - average) ** 2) / (2 * 0.75 ** 2)) + 0.03;
  });
  const max = Math.max(...raw);
  return raw.map((value) => value / max);
}

export function starFill(value: number, index: number): 0 | 0.5 | 1 {
  if (value >= index) return 1;
  if (value >= index - 0.5) return 0.5;
  return 0;
}