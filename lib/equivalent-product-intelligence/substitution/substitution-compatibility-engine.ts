import { resolveProductWithSpecifications } from "./substitution-context";
import { buildAllEquivalentProductEdges } from "../equivalent-graph/equivalent-mapping-builder";
import { EPI_CANONICAL_ID, EPI_RISK_HIGH_MAX } from "../shared/constants";
import { buildCompatibilityGaps } from "./compatibility-gap";
import { buildCompatibilityMatrix } from "./compatibility-matrix";
import { buildSubstitutionContext } from "./substitution-context";
import { buildSubstitutionReasoning } from "./substitution-reasoning";
import {
  calculateSubstitutionRisk,
  resolveSubstitutionRiskLevel,
} from "./substitution-risk-scoring";
import type { SubstitutionAssessment } from "./substitution-types";

export { calculateSubstitutionRisk } from "./substitution-risk-scoring";
export { buildCompatibilityMatrix } from "./compatibility-matrix";
export { buildCompatibilityGaps } from "./compatibility-gap";
export { buildSubstitutionReasoning } from "./substitution-reasoning";

export interface SubstitutionCompatibilityEngine {
  engineId: string;
  contextReady: boolean;
  assessmentCount: number;
  mode: typeof EPI_CANONICAL_ID;
}

let cachedEngine: SubstitutionCompatibilityEngine | undefined;
let cachedAssessments: SubstitutionAssessment[] | undefined;

function resolveCanUseForTender(input: {
  riskLevel: ReturnType<typeof resolveSubstitutionRiskLevel>;
  compatibilityLevel: SubstitutionAssessment["compatibility"]["compatibilityLevel"];
  equivalentScore?: number;
}): boolean {
  if (input.riskLevel === "blocked" || input.riskLevel === "high") return false;
  if (input.compatibilityLevel === "incompatible") return false;
  return (input.equivalentScore ?? 0) >= 35;
}

export function assessSubstitution(
  sourceProductId: string,
  targetProductId: string,
  requirementId?: string,
): SubstitutionAssessment {
  const source = resolveProductWithSpecifications(sourceProductId);
  const target = resolveProductWithSpecifications(targetProductId);
  const edge = buildAllEquivalentProductEdges().find(
    (candidate) =>
      candidate.sourceProductId === sourceProductId &&
      candidate.targetProductId === targetProductId,
  );
  const riskScore = calculateSubstitutionRisk(sourceProductId, targetProductId, requirementId);
  const compatibility = buildCompatibilityMatrix(
    sourceProductId,
    targetProductId,
    requirementId,
  );
  const gaps = buildCompatibilityGaps(sourceProductId, targetProductId, requirementId);
  const reasoning = buildSubstitutionReasoning(
    sourceProductId,
    targetProductId,
    requirementId,
  );
  const riskLevel = resolveSubstitutionRiskLevel(riskScore.totalRiskScore);

  return {
    assessmentId: `epi-assessment-${sourceProductId}-${targetProductId}${requirementId ? `-${requirementId}` : ""}`,
    sourceProductId,
    targetProductId,
    requirementId,
    riskLevel,
    riskScore,
    compatibility,
    gaps,
    explanation: [
      ...reasoning.whySubstitutable,
      ...reasoning.riskSummary,
      ...reasoning.tenderSuitability,
    ],
    trace: [
      edge?.edgeId ?? "no-equivalent-edge",
      compatibility.matrixId,
      ...gaps.map((gap) => gap.gapId),
      ...riskScore.reasons.slice(0, 6),
    ],
    canUseForTender: resolveCanUseForTender({
      riskLevel,
      compatibilityLevel: compatibility.compatibilityLevel,
      equivalentScore: edge?.score,
    }),
    mode: EPI_CANONICAL_ID,
  };
}

export function buildAllSubstitutionAssessments(): SubstitutionAssessment[] {
  if (cachedAssessments) return cachedAssessments;

  cachedAssessments = buildAllEquivalentProductEdges().map((edge) =>
    assessSubstitution(edge.sourceProductId, edge.targetProductId),
  );

  return cachedAssessments;
}

export function buildSubstitutionCompatibilityEngine(): SubstitutionCompatibilityEngine {
  if (cachedEngine) return cachedEngine;

  const context = buildSubstitutionContext();
  const assessments = buildAllSubstitutionAssessments();

  cachedEngine = {
    engineId: "epi-substitution-compatibility-engine-v42-p3",
    contextReady: context.contextReady,
    assessmentCount: assessments.length,
    mode: EPI_CANONICAL_ID,
  };

  return cachedEngine;
}

export function isSubstitutionBlocked(riskScore: number): boolean {
  return riskScore > EPI_RISK_HIGH_MAX;
}
