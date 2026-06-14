import type { IndustryExecution } from "@/lib/industry-execution";
import type { IndustryWorkflowStatus, WorkflowScore } from "./shared/types";

function resolveWorkflowStatus(
  execution: IndustryExecution,
  totalWorkflowScore: number,
  rank: number,
): IndustryWorkflowStatus {
  if (execution.executionStatus === "blocked" || totalWorkflowScore < 72) {
    return "blocked";
  }

  if (execution.executionStatus === "planned") {
    return "draft";
  }

  if (execution.executionStatus === "executing" && rank === 2) {
    return "paused";
  }

  if (execution.executionStatus === "executing") {
    return "running";
  }

  if (execution.executionStatus === "completed") {
    return "completed";
  }

  return "planned";
}

export function buildWorkflowScore(
  workflowId: string,
  execution: IndustryExecution,
  rank: number,
): WorkflowScore {
  const feasibility = execution.score.feasibility;
  const readiness = execution.score.readiness;
  const impact = execution.score.impact;
  const urgency = execution.score.urgency;
  const confidence = execution.score.confidence;
  const executionStrength = execution.score.totalExecutionScore;
  const totalWorkflowScore = Math.round(
    feasibility * 0.2 +
      readiness * 0.2 +
      impact * 0.15 +
      urgency * 0.1 +
      confidence * 0.1 +
      executionStrength * 0.25,
  );

  return {
    scoreId: `workflow-score-${workflowId}`,
    workflowId,
    feasibility,
    readiness,
    impact,
    urgency,
    confidence,
    executionStrength,
    totalWorkflowScore,
    mode: "industry-workflow",
  };
}

export function resolveWorkflowStatusFromExecution(
  execution: IndustryExecution,
  score: WorkflowScore,
  rank: number,
): IndustryWorkflowStatus {
  return resolveWorkflowStatus(execution, score.totalWorkflowScore, rank);
}
