import { resolveProductWithSpecifications } from "./substitution-context";
import { buildAllEquivalentProductEdges } from "../equivalent-graph/equivalent-mapping-builder";
import { EPI_CANONICAL_ID } from "../shared/constants";
import { buildCompatibilityGaps } from "./compatibility-gap";
import { buildCompatibilityMatrix } from "./compatibility-matrix";
import {
  calculateSubstitutionRisk,
  resolveSubstitutionRiskLevel,
} from "./substitution-risk-scoring";
import type { SubstitutionReasoning } from "./substitution-types";

export function buildSubstitutionReasoning(
  sourceProductId: string,
  targetProductId: string,
  requirementId?: string,
): SubstitutionReasoning {
  const source = resolveProductWithSpecifications(sourceProductId);
  const target = resolveProductWithSpecifications(targetProductId);
  const edge = buildAllEquivalentProductEdges().find(
    (candidate) =>
      candidate.sourceProductId === sourceProductId &&
      candidate.targetProductId === targetProductId,
  );
  const risk = calculateSubstitutionRisk(sourceProductId, targetProductId, requirementId);
  const compatibility = buildCompatibilityMatrix(
    sourceProductId,
    targetProductId,
    requirementId,
  );
  const gaps = buildCompatibilityGaps(sourceProductId, targetProductId, requirementId);
  const riskLevel = resolveSubstitutionRiskLevel(risk.totalRiskScore);

  const whySubstitutable = [
    edge
      ? `Equivalent mapping kind "${edge.kind}" with score ${edge.score} supports substitution.`
      : "No direct equivalent edge exists; assessment is exploratory only.",
    `Specification overlap ratio is ${(compatibility.specMatchRatio * 100).toFixed(0)}%.`,
    source && target
      ? `Both products operate in related categories (${source.category} -> ${target.category}).`
      : "Product categories are related enough for substitution analysis.",
  ];

  const whyNotFullyCompatible = gaps.length
    ? gaps.slice(0, 4).map((gap) => gap.explanation)
    : ["No material compatibility gaps detected at specification level."];

  const riskSummary = [
    `Overall substitution risk is ${riskLevel} (${risk.totalRiskScore}/100).`,
    `Compliance risk=${risk.complianceRiskScore}, delivery risk=${risk.deliveryRiskScore}, brand risk=${risk.brandRiskScore}.`,
    `Performance risk=${risk.performanceRiskScore}, price risk=${risk.priceRiskScore}, evidence risk=${risk.evidenceRiskScore}.`,
  ];

  const tenderSuitability = [
    riskLevel === "blocked"
      ? "Not suitable for tender submission without mitigation."
      : riskLevel === "high"
        ? "Use only with explicit exception approval in tender response."
        : compatibility.compatibilityLevel === "compatible"
          ? "Suitable for tender-grade substitution with standard narrative."
          : "Suitable for conditional tender use with gap disclosure.",
  ];

  const usableScenarios = [
    compatibility.compatibilityLevel === "compatible"
      ? "Primary equipment substitution in compliant proposals."
      : "Backup substitution when primary SKU is unavailable.",
    riskLevel === "low" ? "Budget optimization without major compliance exposure." : "",
    edge?.kind === "upgrade-substitute"
      ? "Upgrade path positioning against competitor baseline."
      : "",
    edge?.kind === "emergency-substitute"
      ? "Emergency fulfillment / delivery recovery scenarios."
      : "",
  ].filter(Boolean);

  return {
    reasoningId: `epi-reasoning-${sourceProductId}-${targetProductId}`,
    sourceProductId,
    targetProductId,
    requirementId,
    whySubstitutable,
    whyNotFullyCompatible,
    riskSummary,
    tenderSuitability,
    usableScenarios,
    mode: EPI_CANONICAL_ID,
  };
}
