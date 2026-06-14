import { buildBidCommercialBundle } from "@/lib/bid-commercial-integration";
import type {
  ProposalIntelligenceInput,
  ProposalRecommendationOutput,
  ProposalRisk,
} from "../shared/types";
import { buildRiskAnalysis } from "../risk-analysis/builders";
import { buildProposalScore } from "../scoring/builders";

export function buildProposalRecommendations(
  input: ProposalIntelligenceInput,
): ProposalRecommendationOutput {
  const bundle = buildBidCommercialBundle(input);
  const risks = buildRiskAnalysis(input);
  const scoreBreakdown = buildProposalScore(input);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const inventoryRisk = risks.find((r) => r.category === "inventory");
  const supplierRisk = risks.find((r) => r.category === "supplier-concentration");
  const leadTimeRisk = risks.find((r) => r.category === "lead-time");
  const serviceRisk = risks.find((r) => r.category === "service-coverage");
  const pricingRisk = risks.find((r) => r.category === "pricing");

  if (inventoryRisk?.level === "low") {
    strengths.push("Inventory available");
  } else if (inventoryRisk?.level === "medium") {
    weaknesses.push("Limited inventory buffer");
    recommendations.push("Maintain safety stock");
  } else if (inventoryRisk?.level === "high") {
    weaknesses.push("Insufficient inventory for order quantity");
    recommendations.push("Increase warehouse replenishment before bid submission");
  }

  if (leadTimeRisk?.level === "low") {
    strengths.push("Fast delivery");
  } else {
    weaknesses.push("Extended delivery lead time");
    recommendations.push("Confirm expedited shipping options with supplier");
  }

  if (serviceRisk?.level === "low") {
    strengths.push("Strong supplier coverage");
  } else {
    weaknesses.push("Limited service provider coverage");
    recommendations.push("Engage additional regional service partner");
  }

  if (supplierRisk?.level === "medium" || supplierRisk?.level === "high") {
    weaknesses.push("Single supplier dependency");
    recommendations.push("Add secondary supplier");
    recommendations.push("Maintain safety stock");
  }

  if (pricingRisk?.level === "high") {
    weaknesses.push("Price competitiveness below target");
    recommendations.push("Adopt bulk procurement rules");
  } else if (pricingRisk?.level === "medium") {
    recommendations.push("Apply project-type discount rules to improve margin");
  }

  if (scoreBreakdown.catalogScore >= 100) {
    strengths.push("Complete equipment catalog data");
  }
  if (scoreBreakdown.procurementScore >= 85 && pricingRisk?.level === "low") {
    strengths.push("Competitive bulk pricing applied");
  }

  if (bundle.supplierNetwork.dealer.length > 0 && !strengths.includes("Strong supplier coverage")) {
    strengths.push("Regional dealer network established");
  }

  return {
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    recommendations: [...new Set(recommendations)],
  };
}

export function formatRiskSummaries(risks: ProposalRisk[]): string[] {
  return risks
    .filter((r) => r.level !== "low")
    .map((r) => {
      if (r.category === "supplier-concentration") {
        return "Regional concentration risk";
      }
      if (r.category === "inventory" && r.level === "medium") {
        return "Inventory buffer risk";
      }
      if (r.category === "lead-time") {
        return "Lead time schedule risk";
      }
      if (r.category === "service-coverage") {
        return "Service coverage gap";
      }
      if (r.category === "pricing") {
        return "Pricing competitiveness risk";
      }
      return r.description;
    });
}
