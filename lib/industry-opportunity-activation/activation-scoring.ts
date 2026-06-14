import { getOrganizationById } from "@/lib/industry/organization-registry";
import type { IndustryOpportunity } from "@/lib/industry-opportunity";
import type {
  IndustryActivationOpportunityType,
  IndustryOpportunityActivationStatus,
  OpportunityActivationScore,
} from "./shared/types";

function computeFeasibility(
  opportunity: IndustryOpportunity,
  opportunityType: IndustryActivationOpportunityType,
): number {
  const networkBoost = Math.min(30, opportunity.score.networkEffect * 0.3);
  const typeBase: Record<IndustryActivationOpportunityType, number> = {
    supplier: 82,
    brand: 75,
    tender: 70,
    partnership: 68,
  };

  const org = getOrganizationById(opportunity.subjectId);
  const orgBoost = org?.status === "active" ? 8 : 0;

  return Math.min(100, Math.round(typeBase[opportunityType] + networkBoost * 0.4 + orgBoost));
}

function computeReadiness(opportunity: IndustryOpportunity): number {
  const insightBoost = Math.min(20, opportunity.insightIds.length * 8);
  const scoreBoost = Math.min(25, opportunity.score.totalScore * 0.25);
  return Math.min(100, Math.round(45 + insightBoost + scoreBoost));
}

function resolveActivationStatus(
  score: Omit<OpportunityActivationScore, "scoreId" | "activationId" | "mode">,
): IndustryOpportunityActivationStatus {
  if (score.totalActivationScore >= 75 && score.feasibility >= 70 && score.readiness >= 65) {
    return "ready";
  }
  if (score.feasibility < 60) {
    return "blocked";
  }
  return "pending";
}

export function buildOpportunityActivationScore(
  activationId: string,
  opportunity: IndustryOpportunity,
): OpportunityActivationScore {
  const feasibility = computeFeasibility(opportunity, opportunity.opportunityType);
  const readiness = computeReadiness(opportunity);
  const impact = opportunity.score.impact;
  const urgency = opportunity.score.urgency;
  const confidence = opportunity.score.confidence;
  const totalActivationScore = Math.round(
    feasibility * 0.25 + readiness * 0.25 + impact * 0.2 + urgency * 0.15 + confidence * 0.15,
  );

  return {
    scoreId: `activation-score-${activationId}`,
    activationId,
    feasibility,
    readiness,
    impact,
    urgency,
    confidence,
    totalActivationScore,
    mode: "industry-opportunity-activation",
  };
}

export function resolveActivationStatusFromScore(
  score: OpportunityActivationScore,
): IndustryOpportunityActivationStatus {
  return resolveActivationStatus(score);
}
