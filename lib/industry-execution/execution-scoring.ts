import type { IndustryOpportunityActivation } from "@/lib/industry-opportunity-activation";
import type { ExecutionScore, IndustryExecutionStatus } from "./shared/types";

function resolveExecutionStatus(
  activation: IndustryOpportunityActivation,
  totalExecutionScore: number,
  rank: number,
): IndustryExecutionStatus {
  if (activation.activationStatus === "blocked" || totalExecutionScore < 72) {
    return "blocked";
  }

  if (activation.activationStatus === "pending") {
    return "planned";
  }

  if (totalExecutionScore >= 84 && rank <= 2) {
    return "executing";
  }

  if (totalExecutionScore >= 80 && rank <= 5) {
    return "completed";
  }

  return "ready";
}

export function buildExecutionScore(
  executionId: string,
  activation: IndustryOpportunityActivation,
  rank: number,
): ExecutionScore {
  const feasibility = activation.score.feasibility;
  const readiness = activation.score.readiness;
  const impact = activation.score.impact;
  const urgency = activation.score.urgency;
  const confidence = activation.score.confidence;
  const activationStrength = activation.score.totalActivationScore;
  const totalExecutionScore = Math.round(
    feasibility * 0.2 +
      readiness * 0.2 +
      impact * 0.15 +
      urgency * 0.1 +
      confidence * 0.1 +
      activationStrength * 0.25,
  );

  return {
    scoreId: `execution-score-${executionId}`,
    executionId,
    feasibility,
    readiness,
    impact,
    urgency,
    confidence,
    activationStrength,
    totalExecutionScore,
    mode: "industry-execution",
  };
}

export function resolveExecutionStatusFromActivation(
  activation: IndustryOpportunityActivation,
  score: ExecutionScore,
  rank: number,
): IndustryExecutionStatus {
  return resolveExecutionStatus(activation, score.totalExecutionScore, rank);
}
