import type { IndustryWorkflow } from "@/lib/industry-workflow";
import type { IndustryPipelineStatus, PipelineScore } from "./shared/types";

function resolvePipelineStatus(
  workflow: IndustryWorkflow,
  totalPipelineScore: number,
  rank: number,
): IndustryPipelineStatus {
  if (workflow.workflowStatus === "blocked" || totalPipelineScore < 72) {
    return "lost";
  }

  if (workflow.workflowStatus === "draft") {
    return "lead";
  }

  if (workflow.workflowStatus === "planned" && totalPipelineScore < 77) {
    return "qualified";
  }

  if (workflow.workflowStatus === "planned" && totalPipelineScore < 80) {
    return "engaged";
  }

  if (workflow.workflowStatus === "planned") {
    return "proposal";
  }

  if (workflow.workflowStatus === "paused") {
    return "engaged";
  }

  if (workflow.workflowStatus === "running") {
    return "negotiation";
  }

  if (workflow.workflowStatus === "completed" && rank <= 3) {
    return "won";
  }

  if (workflow.workflowStatus === "completed") {
    return "negotiation";
  }

  return "qualified";
}

export function buildPipelineScore(
  pipelineId: string,
  workflow: IndustryWorkflow,
  rank: number,
): PipelineScore {
  const feasibility = workflow.score.feasibility;
  const readiness = workflow.score.readiness;
  const impact = workflow.score.impact;
  const urgency = workflow.score.urgency;
  const confidence = workflow.score.confidence;
  const workflowStrength = workflow.score.totalWorkflowScore;
  const totalPipelineScore = Math.round(
    feasibility * 0.2 +
      readiness * 0.2 +
      impact * 0.15 +
      urgency * 0.1 +
      confidence * 0.1 +
      workflowStrength * 0.25,
  );

  return {
    scoreId: `pipeline-score-${pipelineId}`,
    pipelineId,
    feasibility,
    readiness,
    impact,
    urgency,
    confidence,
    workflowStrength,
    totalPipelineScore,
    mode: "industry-pipeline",
  };
}

export function resolvePipelineStatusFromWorkflow(
  workflow: IndustryWorkflow,
  score: PipelineScore,
  rank: number,
): IndustryPipelineStatus {
  return resolvePipelineStatus(workflow, score.totalPipelineScore, rank);
}
