import type { IndustryPipeline } from "@/lib/industry-pipeline";
import type { IndustryLifecycleStatus, LifecycleScore } from "./shared/types";

function resolveLifecycleStatus(
  pipeline: IndustryPipeline,
  totalLifecycleScore: number,
  rank: number,
): IndustryLifecycleStatus {
  if (pipeline.pipelineStatus === "lost" || totalLifecycleScore < 72) {
    return "closed";
  }

  if (pipeline.pipelineStatus === "lead") {
    return "discovered";
  }

  if (pipeline.pipelineStatus === "qualified") {
    return "qualified";
  }

  if (pipeline.pipelineStatus === "proposal") {
    return "designed";
  }

  if (pipeline.pipelineStatus === "engaged" && rank === 2) {
    return "delivering";
  }

  if (pipeline.pipelineStatus === "engaged" && totalLifecycleScore >= 77) {
    return "retained";
  }

  if (pipeline.pipelineStatus === "engaged") {
    return "designed";
  }

  if (pipeline.pipelineStatus === "negotiation" && rank <= 2) {
    return "bidding";
  }

  if (pipeline.pipelineStatus === "negotiation") {
    return "delivering";
  }

  if (pipeline.pipelineStatus === "won") {
    return "awarded";
  }

  return "qualified";
}

export function buildLifecycleScore(
  lifecycleId: string,
  pipeline: IndustryPipeline,
  rank: number,
): LifecycleScore {
  const feasibility = pipeline.score.feasibility;
  const readiness = pipeline.score.readiness;
  const impact = pipeline.score.impact;
  const urgency = pipeline.score.urgency;
  const confidence = pipeline.score.confidence;
  const pipelineStrength = pipeline.score.totalPipelineScore;
  const totalLifecycleScore = Math.round(
    feasibility * 0.2 +
      readiness * 0.2 +
      impact * 0.15 +
      urgency * 0.1 +
      confidence * 0.1 +
      pipelineStrength * 0.25,
  );

  return {
    scoreId: `lifecycle-score-${lifecycleId}`,
    lifecycleId,
    feasibility,
    readiness,
    impact,
    urgency,
    confidence,
    pipelineStrength,
    totalLifecycleScore,
    mode: "industry-lifecycle",
  };
}

export function resolveLifecycleStatusFromPipeline(
  pipeline: IndustryPipeline,
  score: LifecycleScore,
  rank: number,
): IndustryLifecycleStatus {
  return resolveLifecycleStatus(pipeline, score.totalLifecycleScore, rank);
}
