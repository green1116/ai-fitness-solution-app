/**
 * E07-P6 — Workforce Learning Evaluator
 * Scores collaboration results and measures learning effect
 */

import type { CollaborationExecutionResult } from "../collaboration/collaboration.types";
import type {
  LearningEvaluation,
  LearningMeasurement,
} from "./learning.types";

export function evaluateCollaborationResult(
  result: CollaborationExecutionResult | undefined,
  collaborationId: string,
  targetScore: number,
): LearningEvaluation {
  if (!result) {
    return {
      collaborationId,
      score: 0,
      completedSteps: 0,
      stepCount: 0,
      status: "none",
      findings: ["no collaboration result"],
      needsImprovement: true,
      readOnly: true,
    };
  }

  const completedSteps = result.orchestration?.completedSteps ?? 0;
  const stepCount = result.orchestration?.plan.stepCount ?? 0;
  const score =
    result.success && stepCount > 0
      ? Math.round((completedSteps / stepCount) * 100)
      : result.success
        ? 100
        : 0;

  const findings: string[] = [];
  if (!result.success) {
    findings.push(`status=${result.status}: ${result.errorMessage ?? "unknown"}`);
  }
  if (result.request.decision && result.request.decision !== "approve") {
    findings.push(`humanDecision=${result.request.decision}`);
  }

  return {
    collaborationId,
    score,
    completedSteps,
    stepCount,
    humanDecision: result.request.decision,
    status: result.status,
    findings,
    needsImprovement: score < targetScore || !result.success,
    readOnly: true,
  };
}

export function measureLearning(
  baseline: LearningEvaluation,
  updated: LearningEvaluation,
  targetScore: number,
): LearningMeasurement {
  const delta = updated.score - baseline.score;
  const improved = delta > 0 || (!baseline.needsImprovement && delta === 0);
  const reachedTarget = updated.score >= targetScore && !updated.needsImprovement;

  return {
    baselineScore: baseline.score,
    updatedScore: updated.score,
    delta,
    improved,
    reachedTarget,
    verdict: [
      `baseline=${baseline.score}`,
      `updated=${updated.score}`,
      `delta=${delta >= 0 ? "+" : ""}${delta}`,
      `target${reachedTarget ? " reached" : " missed"}`,
    ].join(" "),
    readOnly: true,
  };
}
