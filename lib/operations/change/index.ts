export * from "./types";
export * from "./classification";
export * from "./assessment";
export * from "./approval";
export * from "./workflow";
export * from "./audit";
export * from "./metrics";
export * from "./report";

import {
  AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION,
  type AutonomousChangeManagementRuntimeInput,
  type AutonomousChangeManagementRuntimeResult,
  type ChangeLifecyclePhase,
  type ChangeStatus,
} from "./types";
import { buildChangeRequests, classifyChangeRequests } from "./classification";
import { assessChangeRequests } from "./assessment";
import { evaluateChangeApprovals } from "./approval";
import { buildChangeWorkflowPlans, resolveChangeStatusFromExecution } from "./workflow";
import { buildChangeAuditBundle } from "./audit";
import { computeChangeMetrics } from "./metrics";
import { buildChangeReport } from "./report";

const LIFECYCLE_PHASES: ChangeLifecyclePhase[] = [
  "describe",
  "classify",
  "assess",
  "approve",
  "orchestrate",
  "execute",
  "rollback",
  "audit",
];

export function buildAutonomousChangeManagementRuntime(
  input: AutonomousChangeManagementRuntimeInput,
): AutonomousChangeManagementRuntimeResult {
  const requests = buildChangeRequests({
    deploymentId: input.deploymentId,
    proposals: input.autonomous.proposals.map((p) => ({
      proposalId: p.proposalId,
      action: p.action,
      rationale: p.rationale,
      confidence: p.confidence,
    })),
  });

  const classifications = classifyChangeRequests({
    deploymentId: input.deploymentId,
    requests,
  });

  const assessments = assessChangeRequests({
    deploymentId: input.deploymentId,
    requests,
    autonomous: input.autonomous,
  });

  const approvals = evaluateChangeApprovals({
    deploymentId: input.deploymentId,
    requests,
    assessments,
    autonomous: input.autonomous,
  });

  const plans = buildChangeWorkflowPlans({
    deploymentId: input.deploymentId,
    requests,
    approvals,
  });

  const audit = buildChangeAuditBundle({
    deploymentId: input.deploymentId,
    requests,
    plans,
    approvals,
    execution: input.execution,
    lifecyclePhases: LIFECYCLE_PHASES,
  });

  const metrics = computeChangeMetrics({
    deploymentId: input.deploymentId,
    requests,
    approvals,
    plans,
    audit,
    execution: input.execution,
  });

  const report = buildChangeReport({
    deploymentId: input.deploymentId,
    requests,
    assessments,
    approvals,
    metrics,
  });

  const lifecycleClosed =
    audit.outcome.success &&
    (plans.length > 0 || approvals.some((a) => a.approved));

  const flags = {
    classification: classifications.length > 0,
    assessment: assessments.length > 0,
    approval: approvals.length > 0,
    workflow: plans.length >= 0,
    audit: audit.records.length > 0 && audit.trace.events.length > 0,
    metrics: metrics.changes >= 0,
    reporting: report.summary.text.length > 0,
  };

  const status = resolveChangeStatusFromExecution({
    plans,
    executionStatus: input.execution?.status,
  });

  const changeManagementId = `autonomous-change-management-${input.deploymentId}`;
  const traceId = `autonomous-change-management-trace-${input.deploymentId}`;

  return {
    version: AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION,
    registry: { changeManagementId, requestCount: requests.length },
    lifecycle: {
      lifecycleId: `change-lifecycle-${input.deploymentId}`,
      phases: LIFECYCLE_PHASES,
      currentPhase: lifecycleClosed ? "audit" : plans.length > 0 ? "orchestrate" : "approve",
      closed: lifecycleClosed,
    },
    requests,
    classifications,
    assessments,
    approvals,
    plans,
    audit,
    metrics,
    report,
    flags,
    summary: {
      summaryId: `change-management-summary-${Date.now()}`,
      text: `${report.summary.text} lifecycle=${lifecycleClosed} plans=${plans.length} status=${status}`,
      traceId,
    },
    status,
  };
}

export { AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION };
