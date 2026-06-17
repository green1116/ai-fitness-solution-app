import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { findRequirementComplianceById } from "@/lib/requirement-intelligence";
import { getAllRealEquipment, getRealPricingBySku } from "@/lib/real-catalog-foundation";
import { buildBidStrategyContext } from "@/lib/tender-knowledge-graph";
import { buildAllEquivalentProductEdges } from "../equivalent-graph/equivalent-mapping-builder";
import type { EquivalentProductEdge } from "../equivalent-graph/equivalent-graph-types";
import {
  CANONICAL_EQUIVALENT_TENDER_ID,
  EPI_RISK_HIGH_MAX,
  EPI_RISK_LOW_MAX,
  EPI_RISK_MEDIUM_MAX,
} from "../shared/constants";
import { resolveProductWithSpecifications } from "./substitution-context";
import type { SubstitutionRiskLevel, SubstitutionRiskScore } from "./substitution-types";

function findEquivalentEdge(
  sourceProductId: string,
  targetProductId: string,
): EquivalentProductEdge | undefined {
  return buildAllEquivalentProductEdges().find(
    (edge) =>
      edge.sourceProductId === sourceProductId && edge.targetProductId === targetProductId,
  );
}

function clampRisk(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveRiskLevel(totalRiskScore: number): SubstitutionRiskLevel {
  if (totalRiskScore <= EPI_RISK_LOW_MAX) return "low";
  if (totalRiskScore <= EPI_RISK_MEDIUM_MAX) return "medium";
  if (totalRiskScore <= EPI_RISK_HIGH_MAX) return "high";
  return "blocked";
}

function computeComplianceRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  requirementId?: string,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 20;

  if (requirementId) {
    const compliance = findRequirementComplianceById(requirementId);
    if (compliance) {
      score += 100 - compliance.complianceScore;
      reasons.push(`requirement-compliance=${compliance.complianceScore}`);
      if (!compliance.satisfied) {
        score += 15;
        reasons.push("requirement-not-satisfied");
      }
    }
  }

  if (source.brandId && target.brandId && source.brandId !== target.brandId) {
    score += 18;
    reasons.push("cross-brand-compliance-exposure");
  }

  return { score: clampRisk(score), reasons };
}

function computeDeliveryRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  edge?: EquivalentProductEdge,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 15;

  const sourceEquipment = getAllRealEquipment().find((entry) => entry.sku === source.skuId);
  const targetEquipment = getAllRealEquipment().find((entry) => entry.sku === target.skuId);
  if (sourceEquipment && targetEquipment) {
    const leadDelta = Math.abs(targetEquipment.leadTimeDays - sourceEquipment.leadTimeDays);
    score += Math.min(35, Math.round(leadDelta / 2));
    reasons.push(`lead-time-delta=${leadDelta}d`);
  } else {
    reasons.push("lead-time-data-unavailable");
    score += 10;
  }

  if (edge?.kind === "emergency-substitute") {
    score += 25;
    reasons.push("emergency-substitute-delivery-pressure");
  }

  return { score: clampRisk(score), reasons };
}

function computeBrandRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  edge?: EquivalentProductEdge,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 10;

  if (!source.brandId || !target.brandId) {
    score += 20;
    reasons.push("brand-link-incomplete");
  } else if (source.brandId !== target.brandId) {
    score += edge?.kind === "cross-brand-equivalent" ? 35 : 28;
    reasons.push(`brand-shift:${source.brandId}->${target.brandId}`);
  } else {
    reasons.push("same-brand-low-risk");
  }

  return { score: clampRisk(score), reasons };
}

function computePerformanceRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  edge?: EquivalentProductEdge,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 15;

  if (source.category !== target.category) {
    score += 30;
    reasons.push(`category-shift:${source.category}->${target.category}`);
  }

  if (edge) {
    score += Math.max(0, 100 - edge.score);
    reasons.push(`equivalent-fit=${edge.score}`);
    if (edge.kind === "downgrade-substitute") {
      score += 20;
      reasons.push("downgrade-performance-risk");
    }
  }

  return { score: clampRisk(score), reasons };
}

function computePriceRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const sourcePricing = getRealPricingBySku(source.skuId);
  const targetPricing = getRealPricingBySku(target.skuId);

  if (!sourcePricing || !targetPricing) {
    return { score: 25, reasons: ["pricing-data-unavailable"] };
  }

  const delta = Math.abs(targetPricing.listPrice - sourcePricing.listPrice);
  const ratio =
    sourcePricing.listPrice === 0
      ? 1
      : delta / sourcePricing.listPrice;
  const score = clampRisk(Math.round(ratio * 100));
  reasons.push(`price-delta=${delta}`);
  reasons.push(`price-ratio=${ratio.toFixed(2)}`);

  return { score, reasons };
}

function computeEvidenceRisk(
  source: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
  target: NonNullable<ReturnType<typeof resolveProductWithSpecifications>>,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 20;

  const sourceEvidence = source.brandId ? findEvidenceByBrand(source.brandId) : [];
  const targetEvidence = target.brandId ? findEvidenceByBrand(target.brandId) : [];
  const sourceCount = sourceEvidence.length;
  const targetCount = targetEvidence.length;

  reasons.push(`source-evidence=${sourceCount}`);
  reasons.push(`target-evidence=${targetCount}`);

  if (targetCount === 0) {
    score += 45;
    reasons.push("target-evidence-missing");
  } else if (targetCount < sourceCount) {
    score += 20;
    reasons.push("target-evidence-weaker-than-source");
  }

  return { score: clampRisk(score), reasons };
}

export function resolveSubstitutionRiskLevel(totalRiskScore: number): SubstitutionRiskLevel {
  return resolveRiskLevel(totalRiskScore);
}

export function calculateSubstitutionRisk(
  sourceProductId: string,
  targetProductId: string,
  requirementId?: string,
): SubstitutionRiskScore {
  const source = resolveProductWithSpecifications(sourceProductId);
  const target = resolveProductWithSpecifications(targetProductId);
  if (!source || !target) {
    return {
      totalRiskScore: 100,
      complianceRiskScore: 100,
      deliveryRiskScore: 100,
      brandRiskScore: 100,
      performanceRiskScore: 100,
      priceRiskScore: 100,
      evidenceRiskScore: 100,
      reasons: ["product-not-found"],
    };
  }

  const edge = findEquivalentEdge(sourceProductId, targetProductId);
  const compliance = computeComplianceRisk(source, target, requirementId);
  const delivery = computeDeliveryRisk(source, target, edge);
  const brand = computeBrandRisk(source, target, edge);
  const performance = computePerformanceRisk(source, target, edge);
  const price = computePriceRisk(source, target);
  const evidence = computeEvidenceRisk(source, target);

  const totalRiskScore = clampRisk(
    compliance.score * 0.2 +
      delivery.score * 0.15 +
      brand.score * 0.15 +
      performance.score * 0.2 +
      price.score * 0.15 +
      evidence.score * 0.15,
  );

  const bidContext = buildBidStrategyContext(CANONICAL_EQUIVALENT_TENDER_ID);
  const reasons = [
    ...compliance.reasons,
    ...delivery.reasons,
    ...brand.reasons,
    ...performance.reasons,
    ...price.reasons,
    ...evidence.reasons,
    `bid-win-level=${bidContext.winProbability.winLevel}`,
    `competition-pressure=${bidContext.competitionPressure}`,
    `total-risk=${totalRiskScore}`,
  ];

  return {
    totalRiskScore,
    complianceRiskScore: compliance.score,
    deliveryRiskScore: delivery.score,
    brandRiskScore: brand.score,
    performanceRiskScore: performance.score,
    priceRiskScore: price.score,
    evidenceRiskScore: evidence.score,
    reasons,
  };
}
