import type { ProposalScore } from "./shared/types";

export function buildProposalScore(
  proposalId: string,
  input: {
    complianceScore: number;
    technicalScore: number;
    commercialScore: number;
    competitionScore: number;
    winningScore: number;
  },
): ProposalScore {
  const totalProposalScore = Math.round(
    input.complianceScore * 0.2 +
      input.technicalScore * 0.25 +
      input.commercialScore * 0.2 +
      input.competitionScore * 0.15 +
      input.winningScore * 0.2,
  );

  return {
    scoreId: `proposal-score-${proposalId}`,
    proposalId,
    complianceScore: input.complianceScore,
    technicalScore: input.technicalScore,
    commercialScore: input.commercialScore,
    competitionScore: input.competitionScore,
    winningScore: input.winningScore,
    totalProposalScore,
    mode: "tender-proposal",
  };
}

export function deriveProposalScoreFromTender(
  proposalId: string,
  tenderScore: {
    opportunityScore: number;
    budgetScore: number;
    competitionScore: number;
    matchingScore: number;
    winProbability: number;
  },
): ProposalScore {
  return buildProposalScore(proposalId, {
    complianceScore: Math.min(100, tenderScore.matchingScore + 5),
    technicalScore: Math.min(100, tenderScore.opportunityScore + 3),
    commercialScore: Math.min(100, tenderScore.budgetScore + 2),
    competitionScore: tenderScore.competitionScore,
    winningScore: tenderScore.winProbability,
  });
}
