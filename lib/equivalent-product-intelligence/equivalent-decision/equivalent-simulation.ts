import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { findRequirementComplianceById } from "@/lib/requirement-intelligence";
import { buildBidStrategyContext } from "@/lib/tender-knowledge-graph";
import { assessSubstitution } from "../substitution/substitution-compatibility-engine";
import { resolveProductWithSpecifications } from "../substitution/substitution-context";
import { CANONICAL_EQUIVALENT_TENDER_ID, EPI_CANONICAL_ID } from "../shared/constants";
import { findPrimaryProductForRequirement } from "./equivalent-matcher";
import type { EquivalentSubstitutionSimulation } from "./equivalent-decision-types";

const cachedSimulations = new Map<string, EquivalentSubstitutionSimulation>();

function buildSimulationKey(requirementId: string, targetProductId: string): string {
  return `${requirementId}:${targetProductId}`;
}

export function simulateEquivalentSubstitution(
  requirementId: string,
  targetProductId: string,
): EquivalentSubstitutionSimulation | undefined {
  const key = buildSimulationKey(requirementId, targetProductId);
  const cached = cachedSimulations.get(key);
  if (cached) return cached;

  const baselineProductId = findPrimaryProductForRequirement(requirementId);
  if (!baselineProductId) return undefined;

  const baselineAssessment = assessSubstitution(
    baselineProductId,
    baselineProductId,
    requirementId,
  );
  const targetAssessment = assessSubstitution(
    baselineProductId,
    targetProductId,
    requirementId,
  );

  const baselineProduct = resolveProductWithSpecifications(baselineProductId);
  const targetProduct = resolveProductWithSpecifications(targetProductId);
  const baselineEvidence = baselineProduct?.brandId
    ? findEvidenceByBrand(baselineProduct.brandId).length
    : 0;
  const targetEvidence = targetProduct?.brandId
    ? findEvidenceByBrand(targetProduct.brandId).length
    : 0;

  const compliance = findRequirementComplianceById(requirementId);
  const baselineReadiness = compliance?.complianceScore ?? 0;
  const targetReadiness = Math.min(
    100,
    Math.round(
      baselineReadiness * 0.6 +
        targetAssessment.compatibility.specMatchRatio * 100 * 0.4,
    ),
  );

  const tenderContext = buildBidStrategyContext(CANONICAL_EQUIVALENT_TENDER_ID);

  const compatibilityDelta =
    targetAssessment.compatibility.specMatchRatio -
    baselineAssessment.compatibility.specMatchRatio;
  const riskDelta =
    targetAssessment.riskScore.totalRiskScore -
    baselineAssessment.riskScore.totalRiskScore;
  const evidenceDelta = targetEvidence - baselineEvidence;
  const readinessDelta = targetReadiness - baselineReadiness;

  const simulation: EquivalentSubstitutionSimulation = {
    simulationId: `epi-simulation-${requirementId}-${targetProductId}`,
    requirementId,
    targetProductId,
    baselineProductId,
    compatibilityDelta: Math.round(compatibilityDelta * 100) / 100,
    riskDelta: Math.round(riskDelta * 100) / 100,
    evidenceDelta,
    readinessDelta,
    deltaExplanation: `baseline=${baselineProductId} target=${targetProductId} compatDelta=${compatibilityDelta.toFixed(2)} riskDelta=${riskDelta} evidenceDelta=${evidenceDelta} readinessDelta=${readinessDelta} tenderReady=${tenderContext.contextReady}`,
    mode: EPI_CANONICAL_ID,
  };

  cachedSimulations.set(key, simulation);
  return simulation;
}
