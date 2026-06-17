import { PI_CANONICAL_ID } from "../shared/constants";
import type { ProcurementMatchRecord } from "../shared/types";
import { buildProcurementRequirementLinks } from "../procurement-matching/procurement-requirement-link";
import { resolveDecisionFitScore } from "../procurement-matching/procurement-match-scoring";
import type { ProcurementRankingResult } from "./procurement-decision-types";

const rankingCache = new Map<string, ProcurementRankingResult>();

function buildRankedCandidate(
  match: ProcurementMatchRecord,
  rank: number,
  decisionFitScore: number,
): ProcurementRankingResult["candidates"][number] {
  const capabilityFitScore = match.procurementFitScore;
  const brandFitScore = match.evidenceFitScore;
  const totalScore = Math.min(
    100,
    Math.round(
      match.matchScore * 0.4 +
        capabilityFitScore * 0.25 +
        decisionFitScore * 0.2 +
        brandFitScore * 0.15,
    ),
  );

  return {
    rank,
    requirementId: match.requirementId,
    decisionId: match.decisionId,
    supplierId: match.supplierId,
    productId: match.productId,
    matchScore: match.matchScore,
    capabilityFitScore,
    decisionFitScore,
    brandFitScore,
    totalScore,
    mode: PI_CANONICAL_ID,
  };
}

export function rankProcurementCandidates(
  matches: ProcurementMatchRecord[],
): ProcurementRankingResult[] {
  const byRequirement = new Map<string, ProcurementMatchRecord[]>();

  for (const match of matches) {
    const existing = byRequirement.get(match.requirementId) ?? [];
    existing.push(match);
    byRequirement.set(match.requirementId, existing);
  }

  const rankings: ProcurementRankingResult[] = [];

  for (const [requirementId, requirementMatches] of byRequirement) {
    const cached = rankingCache.get(requirementId);
    if (cached) {
      rankings.push(cached);
      continue;
    }

    const requirementLink = buildProcurementRequirementLinks().find(
      (link) => link.requirementId === requirementId,
    );
    const decisionFitScore = resolveDecisionFitScore(requirementLink?.decisionLevel ?? "defer");

    const candidates = [...requirementMatches]
      .map((match) => buildRankedCandidate(match, 0, decisionFitScore))
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (b.capabilityFitScore !== a.capabilityFitScore) {
          return b.capabilityFitScore - a.capabilityFitScore;
        }
        if (b.decisionFitScore !== a.decisionFitScore) {
          return b.decisionFitScore - a.decisionFitScore;
        }
        return b.brandFitScore - a.brandFitScore;
      })
      .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

    const ranking: ProcurementRankingResult = {
      rankingId: `pi-procurement-ranking-${requirementId}`,
      requirementId,
      candidates,
      optimalSupplierId: candidates[0]?.supplierId ?? "",
      alternativeSupplierIds: candidates.slice(1, 4).map((candidate) => candidate.supplierId),
      mode: PI_CANONICAL_ID,
    };

    rankingCache.set(requirementId, ranking);
    rankings.push(ranking);
  }

  return rankings;
}

export function rankProcurementCandidatesForRequirement(
  requirementId: string,
  matches: ProcurementMatchRecord[],
): ProcurementRankingResult | undefined {
  return rankProcurementCandidates(
    matches.filter((match) => match.requirementId === requirementId),
  )[0];
}
