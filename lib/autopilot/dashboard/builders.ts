import { runAutopilotAuditRuntime } from "../audit/runtime";
import { runDeliveryRuntime } from "../delivery/runtime";
import { runHumanReviewRuntime } from "../human-review/runtime";
import { runRetryRuntime } from "../retry/runtime";
import { runStageOrchestrationRuntime } from "../stage-orchestration/runtime";
import { runWorkflowRuntime } from "../workflow/runtime";

export function buildAutopilotDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  completionRate: number;
  successRate: number;
  retryRate: number;
  reviewRate: number;
  deliveryReadiness: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const workflow = runWorkflowRuntime({ deploymentId });
  const orchestration = runStageOrchestrationRuntime({ deploymentId });
  const retry = runRetryRuntime({ deploymentId });
  const review = runHumanReviewRuntime({ deploymentId });
  const delivery = runDeliveryRuntime({ deploymentId });
  const audit = runAutopilotAuditRuntime({ deploymentId });

  const completionRate =
    workflow.status === "success"
      ? Math.round((workflow.payload.workflow.completedSteps / workflow.payload.workflow.totalSteps) * 100)
      : 0;

  const totalExecutions = orchestration.payload?.state.executions.length ?? 8;
  const successCount = orchestration.payload?.state.completedCount ?? 0;
  const successRate = Math.round((successCount / totalExecutions) * 100);

  const retryRecords = retry.payload?.records ?? [];
  const retriedCount = retryRecords.filter((r) => r.attempt > 1 || r.usedFallback).length;
  const retryRate = Math.round((retriedCount / retryRecords.length) * 100);

  const reviewGates = review.payload?.gates ?? [];
  const reviewRate = Math.round(
    (reviewGates.filter((g) => g.requiresHuman).length / reviewGates.length) * 100,
  );

  const deliveryReadiness =
    delivery.status === "success" && delivery.payload.delivery.allReady ? 100 : 0;

  const auditOk = audit.status === "success";

  return {
    completionRate,
    successRate,
    retryRate,
    reviewRate,
    deliveryReadiness: auditOk ? deliveryReadiness : 0,
    summary: `autopilot-dashboard completion=${completionRate}% success=${successRate}% retry=${retryRate}% review=${reviewRate}% delivery=${deliveryReadiness}%`,
  };
}
