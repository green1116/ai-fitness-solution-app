import { getSignalById } from "@/lib/industry-data-network";
import type { IndustryInsight } from "@/lib/industry-insight";
import type { IndustryOpportunityType, OpportunityScore } from "./shared/types";

function priorityImpact(priority: IndustryInsight["priority"]): number {
  if (priority === "high") return 90;
  if (priority === "medium") return 70;
  return 50;
}

function computeUrgency(insight: IndustryInsight, opportunityType: IndustryOpportunityType): number {
  const hasTenderSignal = insight.signalIds.some(
    (id) => getSignalById(id)?.signalType === "TENDER_INTEREST",
  );

  if (opportunityType === "tender" || hasTenderSignal) return 88;
  if (insight.insightType === "opportunity") return 76;
  if (insight.insightType === "trend") return 68;
  if (insight.insightType === "growth") return 62;
  return 55;
}

function computeNetworkEffect(insight: IndustryInsight): number {
  const centrality = insight.signalIds.some(
    (id) => getSignalById(id)?.signalType === "NETWORK_CENTRALITY",
  );
  const growth = insight.signalIds.some(
    (id) => getSignalById(id)?.signalType === "RELATIONSHIP_GROWTH",
  );
  const supply = insight.signalIds.some(
    (id) => getSignalById(id)?.signalType === "SUPPLY_ACTIVITY",
  );

  if (centrality && growth) return 92;
  if (centrality || growth) return 80;
  if (supply) return 65;
  return 45;
}

export function buildOpportunityScore(
  opportunityId: string,
  insight: IndustryInsight,
  opportunityType: IndustryOpportunityType,
): OpportunityScore {
  const impact = priorityImpact(insight.priority);
  const confidence = Math.round(insight.confidence * 100);
  const urgency = computeUrgency(insight, opportunityType);
  const networkEffect = computeNetworkEffect(insight);
  const totalScore = Math.round(
    impact * 0.35 + confidence * 0.25 + urgency * 0.2 + networkEffect * 0.2,
  );

  return {
    scoreId: `opp-score-${opportunityId}`,
    opportunityId,
    impact,
    confidence,
    urgency,
    networkEffect,
    totalScore,
    mode: "industry-opportunity",
  };
}
