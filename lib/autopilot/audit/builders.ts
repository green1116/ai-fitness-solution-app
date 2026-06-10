import { runAiCostControlRuntime } from "@/lib/ai-integration/cost-control";
import { buildReviewGates } from "../human-review/builders";
import { buildStageExecutions } from "../stage-orchestration/builders";
import type { AutopilotAuditRecord } from "./types";

const STAGE_COST: Record<string, number> = {
  "tender-upload": 0,
  "tender-intelligence": 0.001,
  "knowledge-fusion": 0.002,
  "proposal-generation": 0.015,
  "proposal-pdf": 0.005,
  "plan-pdf": 0.003,
  "budget-pdf": 0.003,
  "enterprise-zip": 0.001,
};

const STAGE_RUNTIME: Record<string, string> = {
  "tender-upload": "tender/intake",
  "tender-intelligence": "tender-intelligence/assembly",
  "knowledge-fusion": "ai-integration/knowledge-fusion",
  "proposal-generation": "proposal-generation/assembly",
  "proposal-pdf": "proposal-pdf/assembly",
  "plan-pdf": "pdf/tender/plan",
  "budget-pdf": "pdf/tender/budget",
  "enterprise-zip": "entitlements/zipAccess",
};

export function buildAutopilotAuditTrail(input?: {
  deploymentId?: string;
  jobId?: string;
}): AutopilotAuditRecord[] {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const jobId = input?.jobId ?? `autopilot-job-${deploymentId}`;
  const executions = buildStageExecutions(deploymentId);
  const gates = buildReviewGates({ deploymentId });
  const costRuntime = runAiCostControlRuntime({ deploymentId });
  const aiCostPerStage =
    costRuntime.payload.usage.estimatedCostUsd / Math.max(executions.length, 1);

  return executions.map((exec) => {
    const gate = gates.find((g) => g.stepId === exec.stepId);
    const baseCost = STAGE_COST[exec.stepId] ?? 0;
    const costUsd = baseCost + (exec.stepId === "proposal-generation" ? aiCostPerStage : 0);
    return {
      recordId: `audit-${exec.stepId}-${deploymentId}`,
      jobId,
      stageId: exec.stepId,
      runtimeDomain: STAGE_RUNTIME[exec.stepId] ?? exec.stepId,
      costUsd,
      outcome: exec.status === "failed" ? "failure" : "success",
      approval: gate?.decision ?? "n/a",
      message: exec.message,
      tracedAt: new Date().toISOString(),
    };
  });
}
