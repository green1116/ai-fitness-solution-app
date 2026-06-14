import type { TenderScore } from "./shared/types";

export function buildTenderScore(
  tenderId: string,
  input: {
    opportunityScore: number;
    budgetScore: number;
    competitionScore: number;
    matchingScore: number;
  },
): TenderScore {
  const winProbability = Math.round(
    input.opportunityScore * 0.25 +
      input.budgetScore * 0.2 +
      input.competitionScore * 0.15 +
      input.matchingScore * 0.4,
  );
  const totalTenderScore = Math.round(
    input.opportunityScore * 0.25 +
      input.budgetScore * 0.2 +
      input.competitionScore * 0.15 +
      input.matchingScore * 0.2 +
      winProbability * 0.2,
  );

  return {
    scoreId: `tender-score-${tenderId}`,
    tenderId,
    opportunityScore: input.opportunityScore,
    budgetScore: input.budgetScore,
    competitionScore: input.competitionScore,
    matchingScore: input.matchingScore,
    winProbability,
    totalTenderScore,
    mode: "tender-hub",
  };
}
