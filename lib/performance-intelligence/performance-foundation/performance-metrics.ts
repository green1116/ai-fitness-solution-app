import { buildOutcomeRegistry } from "@/lib/win-loss-intelligence";
import { calculateExecutionProgress } from "@/lib/project-delivery-intelligence";
import type { ProjectDeliveryFoundationContext } from "@/lib/project-delivery-intelligence";
import type { PerformanceMetrics } from "../shared/types";

const CHECK_SCORE_BY_STATUS = {
  pass: 100,
  warning: 70,
  fail: 30,
} as const;

function calculateWinRateScore(): number {
  const outcomes = buildOutcomeRegistry().records;
  const wins = outcomes.filter((outcome) => outcome.outcome === "win").length;
  const losses = outcomes.filter((outcome) => outcome.outcome === "loss").length;
  const decided = wins + losses;
  if (decided === 0) return 65;
  return Math.round((wins / decided) * 100);
}

function calculateProjectAcceptanceScore(
  foundation: ProjectDeliveryFoundationContext,
  projectId: string,
): number {
  const checks = foundation.acceptanceChecks.records.filter(
    (check) => check.projectId === projectId,
  );
  if (checks.length === 0) return foundation.readiness.acceptancePassRate * 100;

  const total = checks.reduce(
    (sum, check) => sum + CHECK_SCORE_BY_STATUS[check.status],
    0,
  );
  return Math.round(total / checks.length);
}

function calculateProjectDeliveryScore(
  foundation: ProjectDeliveryFoundationContext,
  projectId: string,
  winRateScore: number,
): number {
  const projectTasks = foundation.execution.entries.filter(
    (entry) => entry.projectId === projectId,
  );
  const taskProgress = calculateExecutionProgress(
    projectTasks.map((entry) => ({
      taskId: entry.taskId,
      milestoneId: entry.milestoneId,
      name: entry.taskId,
      status: entry.status,
    })),
  );

  const projectMilestones = foundation.milestones.records.filter(
    (milestone) => milestone.projectId === projectId,
  );
  const milestoneRate =
    projectMilestones.length === 0
      ? 0
      : (projectMilestones.filter((milestone) => milestone.status === "completed").length /
          projectMilestones.length) *
        100;

  return Math.round(taskProgress * 0.4 + milestoneRate * 0.3 + winRateScore * 0.3);
}

function calculateProjectRiskScore(
  foundation: ProjectDeliveryFoundationContext,
  projectId: string,
): number {
  const projectRisks = foundation.risks.records.filter((risk) => risk.projectId === projectId);
  const projectIssues = foundation.issues.records.filter((issue) => issue.projectId === projectId);

  let penalty = 0;
  penalty += projectRisks.filter((risk) => risk.riskLevel === "high").length * 20;
  penalty += projectRisks.filter((risk) => risk.riskLevel === "medium").length * 10;
  penalty += projectIssues.filter((issue) => issue.status === "open").length * 12;
  penalty += projectIssues.filter((issue) => issue.status === "mitigating").length * 6;

  return Math.max(0, Math.min(100, 100 - penalty));
}

export function calculatePerformanceMetrics(
  foundation: ProjectDeliveryFoundationContext,
  projectId: string,
): PerformanceMetrics {
  const winRateScore = calculateWinRateScore();
  const acceptanceScore = calculateProjectAcceptanceScore(foundation, projectId);
  const deliveryScore = calculateProjectDeliveryScore(foundation, projectId, winRateScore);
  const riskScore = calculateProjectRiskScore(foundation, projectId);
  const totalScore = Math.round(
    acceptanceScore * 0.35 + deliveryScore * 0.35 + riskScore * 0.3,
  );

  return {
    acceptanceScore,
    deliveryScore,
    riskScore,
    totalScore,
  };
}
