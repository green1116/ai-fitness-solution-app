import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildMilestoneRegistry } from "../project-foundation/milestone-registry";
import { buildExecutionContext } from "../execution-layer/execution-context";
import { calculateExecutionProgress } from "../execution-layer/execution-status-registry";
import { buildDeliveryIssueRegistry } from "../risk-issue-layer/delivery-issue-registry";
import { buildDeliveryRiskRegistry } from "../risk-issue-layer/delivery-risk-registry";
import { buildAcceptanceChecks } from "./acceptance-check-builder";
import type { DeliveryReadinessAssessment } from "./acceptance-types";

function calculateMilestoneCompletionRate(): number {
  const milestones = buildMilestoneRegistry().records;
  if (milestones.length === 0) return 0;

  const completed = milestones.filter((milestone) => milestone.status === "completed").length;
  return completed / milestones.length;
}

function calculateTaskCompletionRate(): number {
  return calculateExecutionProgress(buildExecutionContext().tasks) / 100;
}

function calculateRiskClosureRate(): number {
  const risks = buildDeliveryRiskRegistry();
  if (risks.count === 0) return 1;

  const manageable = risks.records.filter((risk) => risk.riskLevel !== "high").length;
  return manageable / risks.count;
}

function calculateIssueClosureRate(): number {
  const issues = buildDeliveryIssueRegistry();
  if (issues.count === 0) return 1;

  const closed = issues.records.filter((issue) => issue.status === "closed").length;
  const mitigating = issues.records.filter((issue) => issue.status === "mitigating").length;
  return (closed + mitigating * 0.5) / issues.count;
}

let cachedAssessment: DeliveryReadinessAssessment | undefined;

export function assessDeliveryReadiness(): DeliveryReadinessAssessment {
  if (cachedAssessment) return cachedAssessment;

  const milestoneCompletionRate = calculateMilestoneCompletionRate();
  const taskCompletionRate = calculateTaskCompletionRate();
  const riskClosureRate = calculateRiskClosureRate();
  const issueClosureRate = calculateIssueClosureRate();
  const acceptancePassRate = buildAcceptanceChecks().passRate;

  const readinessScore = Math.round(
    (milestoneCompletionRate * 0.2 +
      taskCompletionRate * 0.2 +
      riskClosureRate * 0.2 +
      issueClosureRate * 0.2 +
      acceptancePassRate * 0.2) *
      100,
  );

  cachedAssessment = {
    assessmentId: "pdi-delivery-readiness-v45-p4",
    milestoneCompletionRate,
    taskCompletionRate,
    riskClosureRate,
    issueClosureRate,
    acceptancePassRate,
    readinessScore,
    mode: PDI_CANONICAL_ID,
  };

  return cachedAssessment;
}
