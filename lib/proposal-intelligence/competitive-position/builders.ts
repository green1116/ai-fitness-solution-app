import { buildBidCommercialBundle } from "@/lib/bid-commercial-integration";
import type { CompetitivePositionAnalysis, ProposalIntelligenceInput } from "../shared/types";
import { buildRiskAnalysis } from "../risk-analysis/builders";
import { buildProposalScore } from "../scoring/builders";

function rankFromScore(positionScore: number): number {
  if (positionScore >= 85) return 1;
  if (positionScore >= 78) return 2;
  if (positionScore >= 68) return 3;
  if (positionScore >= 55) return 4;
  return 5;
}

export function buildCompetitivePositionAnalysis(
  input: ProposalIntelligenceInput,
): CompetitivePositionAnalysis {
  const bundle = buildBidCommercialBundle(input);
  const scoreBreakdown = buildProposalScore(input);
  const risks = buildRiskAnalysis(input);

  const savingsRate =
    bundle.procurement.channelPricing.listPrice > 0
      ? bundle.savings / bundle.procurement.channelPricing.listPrice
      : 0;
  const pricePosition = Math.min(100, Math.round(55 + savingsRate * 200));

  const leadDays = bundle.leadTime?.leadTimeDays ?? 30;
  let deliveryPosition = 90;
  if (leadDays > 21) deliveryPosition = 55;
  else if (leadDays > 14) deliveryPosition = 70;
  else if (leadDays <= 7) deliveryPosition = 95;

  const supplierCount = bundle.supplierNetwork.supplier.length;
  const supplierPosition =
    supplierCount <= 1 ? 68 : supplierCount === 2 ? 82 : Math.min(100, 70 + supplierCount * 8);

  const serviceCount = bundle.supplierNetwork.service.length;
  const coveragePosition = Math.min(
    100,
    55 + serviceCount * 14 + (bundle.supplierNetwork.coverage ? 12 : 0),
  );

  const elevatedRisks = risks.filter((r) => r.level !== "low").length;
  const riskPosition = Math.max(40, 100 - elevatedRisks * 12 - risks.filter((r) => r.level === "high").length * 8);

  const positionScore = Math.round(
    (pricePosition + deliveryPosition + supplierPosition + coveragePosition + riskPosition) / 5,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (pricePosition >= 80) strengths.push("Competitive project pricing");
  else weaknesses.push("Price position below market benchmark");

  if (deliveryPosition >= 85) strengths.push("Fast delivery lead time");
  else weaknesses.push("Delivery timeline less competitive");

  if (supplierPosition >= 80) strengths.push("Strong supplier coverage");
  else weaknesses.push("Limited supplier diversification");

  if (coveragePosition >= 80) strengths.push("Good regional service coverage");
  else weaknesses.push("Service coverage gaps in target region");

  if (riskPosition < 75) weaknesses.push("Elevated bid risk profile");
  if (scoreBreakdown.catalogScore >= 100) strengths.push("Complete product catalog backing");

  const totalInventory = bundle.supplierNetwork.inventory.reduce(
    (sum, entry) => sum + entry.availableQuantity,
    0,
  );
  if (totalInventory >= input.quantity) {
    strengths.push("Strong inventory availability");
  }

  return {
    pricePosition,
    deliveryPosition,
    supplierPosition,
    coveragePosition,
    riskPosition,
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    competitiveRank: rankFromScore(positionScore),
    positionScore,
  };
}
