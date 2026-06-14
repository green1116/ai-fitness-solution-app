import type { RecommendationCandidate, RecommendationScore } from "./types";

export function buildRecommendationScore(input: {
  candidate: RecommendationCandidate;
  score: number;
  confidence: number;
  reasons: string[];
  signals: Record<string, number>;
}): RecommendationScore {
  return {
    scoreId: `rec-score-${input.candidate.candidateId}`,
    candidateId: input.candidate.candidateId,
    score: Math.min(100, Math.max(0, Math.round(input.score))),
    confidence: Number(Math.min(1, Math.max(0, input.confidence)).toFixed(4)),
    reasons: input.reasons,
    signals: input.signals,
    mode: "industry-recommendation",
  };
}

export function rankCandidates(
  candidates: RecommendationCandidate[],
  scoreFn: (candidate: RecommendationCandidate) => RecommendationScore,
  limit = 5,
): { candidates: RecommendationCandidate[]; scores: RecommendationScore[] } {
  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreFn(candidate) }))
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, limit);

  return {
    candidates: scored.map((entry) => entry.candidate),
    scores: scored.map((entry) => entry.score),
  };
}

export function toRecommendationResult(input: {
  queryId: string;
  query: import("./types").RecommendationQuery;
  candidates: RecommendationCandidate[];
  scores: RecommendationScore[];
}): import("./types").RecommendationQueryResult {
  return {
    queryId: input.queryId,
    query: input.query,
    candidates: input.candidates,
    scores: input.scores,
    hitCount: input.candidates.length,
    recommendationReady: input.candidates.length > 0,
  };
}
