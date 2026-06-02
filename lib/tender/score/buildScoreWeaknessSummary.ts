export function buildScoreWeaknessSummary(
  items: Array<{
    label: string;
    score: number;
    maxScore: number;
    weaknesses?: string[];
  }>
) {
  const sorted = [...items].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore
  );

  const weakestItems = sorted.slice(0, 3);
  const riskPoints = weakestItems.flatMap((item) => item.weaknesses || []).slice(0, 5);

  return {
    weakestItems: weakestItems.map((item) => item.label),
    riskPoints: Array.from(new Set(riskPoints)),
  };
}
