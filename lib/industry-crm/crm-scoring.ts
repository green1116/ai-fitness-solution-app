import type { IndustryLifecycle } from "@/lib/industry-lifecycle";
import type { CRMScore, IndustryCRMStatus } from "./shared/types";

function resolveCRMStatus(
  lifecycle: IndustryLifecycle,
  totalCRMScore: number,
  rank: number,
): IndustryCRMStatus {
  if (lifecycle.lifecycleStatus === "closed" || totalCRMScore < 72) {
    return "churned";
  }

  if (lifecycle.lifecycleStatus === "discovered") {
    return "prospect";
  }

  if (lifecycle.lifecycleStatus === "qualified" && totalCRMScore < 77) {
    return "dormant";
  }

  if (lifecycle.lifecycleStatus === "qualified") {
    return "active";
  }

  if (lifecycle.lifecycleStatus === "retained") {
    return "retained";
  }

  if (lifecycle.lifecycleStatus === "awarded" || (lifecycle.lifecycleStatus === "bidding" && rank <= 2)) {
    return "strategic";
  }

  if (lifecycle.lifecycleStatus === "designed" || lifecycle.lifecycleStatus === "delivering") {
    return "active";
  }

  if (lifecycle.lifecycleStatus === "bidding") {
    return "active";
  }

  return "prospect";
}

export function buildCRMScore(crmId: string, lifecycle: IndustryLifecycle, rank: number): CRMScore {
  const lifecycleStrength = lifecycle.score.totalLifecycleScore;
  const confidence = lifecycle.score.confidence;
  const relationshipStrength = Math.round(
    lifecycle.score.feasibility * 0.3 +
      lifecycle.score.readiness * 0.3 +
      lifecycle.score.confidence * 0.4,
  );
  const retentionScore = Math.round(
    lifecycle.score.readiness * 0.4 +
      lifecycle.score.pipelineStrength * 0.3 +
      confidence * 0.3,
  );
  const expansionScore = Math.round(
    lifecycle.score.impact * 0.4 +
      lifecycle.score.urgency * 0.3 +
      lifecycleStrength * 0.3,
  );
  const totalCRMScore = Math.round(
    relationshipStrength * 0.25 +
      lifecycleStrength * 0.25 +
      confidence * 0.15 +
      retentionScore * 0.2 +
      expansionScore * 0.15,
  );

  return {
    scoreId: `crm-score-${crmId}`,
    crmId,
    relationshipStrength,
    lifecycleStrength,
    confidence,
    retentionScore,
    expansionScore,
    totalCRMScore,
    mode: "industry-crm",
  };
}

export function resolveCRMStatusFromLifecycle(
  lifecycle: IndustryLifecycle,
  score: CRMScore,
  rank: number,
): IndustryCRMStatus {
  return resolveCRMStatus(lifecycle, score.totalCRMScore, rank);
}
