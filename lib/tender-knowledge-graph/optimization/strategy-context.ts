import { analyzeTenderCompetition } from "../competition/competition-analysis";
import { calculateWinProbability } from "../tender-scoring";
import type { TenderStrategyContext } from "./optimization-types";

const cachedContexts = new Map<string, TenderStrategyContext>();

export function buildTenderStrategyContext(tenderId: string): TenderStrategyContext {
  const cached = cachedContexts.get(tenderId);
  if (cached) return cached;

  const winProbability = calculateWinProbability(tenderId);
  const competition = analyzeTenderCompetition(tenderId);

  const context: TenderStrategyContext = {
    contextId: `tkg-strategy-context-${tenderId}`,
    tenderId,
    winProbability,
    competition,
    baselineWinProbability: winProbability.winProbability,
    competitionPressure: competition.metrics.brandWinPressure,
    requirementCoverage: winProbability.requirementCoverage,
    evidenceReadiness: winProbability.evidenceReadiness,
    brandAlignment: winProbability.brandAlignment,
    complianceScore: winProbability.complianceScore,
    contextReady: Boolean(competition.dominantCompetitor) && winProbability.winProbability >= 0,
    mode: "tender-knowledge-graph",
  };

  cachedContexts.set(tenderId, context);
  return context;
}
