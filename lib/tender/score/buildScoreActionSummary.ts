export function buildScoreActionSummary(
  items: Array<{
    label: string;
    score: number;
    maxScore: number;
    actions?: string[];
  }>
) {
  const sorted = [...items].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore
  );

  const weakestItems = sorted.slice(0, 3);
  const priorityActions = weakestItems.flatMap((item) => item.actions || []).slice(0, 6);

  return {
    weakestItems: weakestItems.map((item) => item.label),
    priorityActions: Array.from(new Set(priorityActions)).slice(0, 5),
  };
}
