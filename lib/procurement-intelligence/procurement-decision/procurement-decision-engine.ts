import { PI_CANONICAL_ID } from "../shared/constants";
import { buildProcurementRequirementLinks } from "../procurement-matching/procurement-requirement-link";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";
import type { ProcurementDecisionRecord } from "./procurement-decision-types";
import {
  buildProcurementRecommendation,
  resolveProcurementDecisionLevel,
} from "./procurement-recommendation";
import { rankProcurementCandidatesForRequirement } from "./procurement-ranking";

const decisionCache = new Map<string, ProcurementDecisionRecord[]>();
let cachedAllDecisions: ProcurementDecisionRecord[] | undefined;

function buildDecisionRecord(requirementId: string): ProcurementDecisionRecord | undefined {
  const recommendation = buildProcurementRecommendation(requirementId);
  if (!recommendation) return undefined;

  if (!recommendation.optimalSupplierId) {
    return {
      requirementId,
      decisionId: recommendation.decisionId,
      supplierId: "",
      productId: recommendation.optimalProductId,
      procurementLevel: "defer",
      totalScore: 0,
      rationale: recommendation.recommendationReason,
    };
  }

  const matches = buildProcurementMatches(requirementId);
  const ranking = rankProcurementCandidatesForRequirement(requirementId, matches);
  const optimal = ranking?.candidates[0];
  if (!optimal) return undefined;

  return {
    requirementId,
    decisionId: recommendation.decisionId,
    supplierId: recommendation.optimalSupplierId,
    productId: recommendation.optimalProductId,
    procurementLevel: resolveProcurementDecisionLevel(optimal.totalScore),
    totalScore: optimal.totalScore,
    rationale: [
      ...recommendation.recommendationReason,
      `capability-fit=${optimal.capabilityFitScore}`,
      `brand-fit=${optimal.brandFitScore}`,
      `decision-fit=${optimal.decisionFitScore}`,
    ],
  };
}

export function runProcurementDecisionEngine(
  requirementId?: string,
): ProcurementDecisionRecord[] {
  if (requirementId) {
    const cached = decisionCache.get(requirementId);
    if (cached) return cached;

    const decision = buildDecisionRecord(requirementId);
    const records = decision ? [decision] : [];
    decisionCache.set(requirementId, records);
    return records;
  }

  if (cachedAllDecisions) return cachedAllDecisions;

  const records: ProcurementDecisionRecord[] = [];
  for (const link of buildProcurementRequirementLinks()) {
    const decision = buildDecisionRecord(link.requirementId);
    if (decision) records.push(decision);
  }

  cachedAllDecisions = records;
  return records;
}

export function getProcurementDecisionEngineMode(): typeof PI_CANONICAL_ID {
  return PI_CANONICAL_ID;
}
