export * from "./types";
export * from "./classification";
export * from "./assessment";
export * from "./planning";
export * from "./orchestration";
export * from "./tracking";
export * from "./metrics";
export * from "./report";

import {
  AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION,
  type AutonomousRecoveryOrchestrationRuntimeInput,
  type AutonomousRecoveryOrchestrationRuntimeResult,
  type RecoveryLifecyclePhase,
} from "./types";
import { discoverRecoveryRequests, classifyRecoveryRequests } from "./classification";
import { assessRecoveryRequests } from "./assessment";
import { buildRecoveryPlans } from "./planning";
import { orchestrateRecoveryPlans, resolveRecoveryStatus } from "./orchestration";
import { buildRecoveryTrackingBundle } from "./tracking";
import { computeRecoveryMetrics } from "./metrics";
import { buildRecoveryReport } from "./report";

const LIFECYCLE_PHASES: RecoveryLifecyclePhase[] = [
  "discover",
  "isolate",
  "diagnose",
  "plan",
  "orchestrate",
  "recover",
  "verify",
  "close",
  "audit",
];

export function buildAutonomousRecoveryOrchestrationRuntime(
  input: AutonomousRecoveryOrchestrationRuntimeInput,
): AutonomousRecoveryOrchestrationRuntimeResult {
  const requests = discoverRecoveryRequests({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    autonomous: input.autonomous,
    execution: input.execution,
    change: input.change,
    incident: input.incident,
  });

  const classifications = classifyRecoveryRequests({
    deploymentId: input.deploymentId,
    requests,
  });

  const assessments = assessRecoveryRequests({
    deploymentId: input.deploymentId,
    requests,
    intelligence: input.intelligence,
    autonomous: input.autonomous,
  });

  const plans = buildRecoveryPlans({
    deploymentId: input.deploymentId,
    requests,
    assessments,
  });

  const orchestration = orchestrateRecoveryPlans({
    deploymentId: input.deploymentId,
    plans,
    execution: input.execution,
  });

  const tracking = buildRecoveryTrackingBundle({
    deploymentId: input.deploymentId,
    requests,
    plans,
    orchestrations: orchestration,
    lifecyclePhases: LIFECYCLE_PHASES,
    execution: input.execution,
  });

  const metrics = computeRecoveryMetrics({
    deploymentId: input.deploymentId,
    plans,
    orchestrations: orchestration,
    tracking,
  });

  const report = buildRecoveryReport({
    deploymentId: input.deploymentId,
    requests,
    assessments,
    metrics,
  });

  const lifecycleClosed = tracking.outcome.success && tracking.outcome.verified;

  const flags = {
    classification: classifications.length > 0,
    assessment: assessments.length > 0,
    planning: plans.length >= 0,
    orchestration: orchestration.length >= 0,
    tracking: tracking.timelines.length > 0 && tracking.trace.events.length > 0,
    metrics: metrics.recoveries >= 0,
    reporting: report.summary.text.length > 0,
  };

  const status = resolveRecoveryStatus({
    orchestrations: orchestration,
    executionStatus: input.execution?.status,
  });

  const recoveryOrchestrationId = `autonomous-recovery-orchestration-${input.deploymentId}`;
  const traceId = `autonomous-recovery-orchestration-trace-${input.deploymentId}`;

  return {
    version: AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION,
    registry: { recoveryOrchestrationId, requestCount: requests.length },
    lifecycle: {
      lifecycleId: `recovery-lifecycle-${input.deploymentId}`,
      phases: LIFECYCLE_PHASES,
      currentPhase: lifecycleClosed ? "audit" : orchestration.length > 0 ? "orchestrate" : "plan",
      closed: lifecycleClosed,
    },
    requests,
    classifications,
    assessments,
    plans,
    orchestration,
    tracking,
    metrics,
    report,
    flags,
    summary: {
      summaryId: `recovery-orchestration-summary-${Date.now()}`,
      text: `${report.summary.text} lifecycle=${lifecycleClosed} plans=${plans.length} status=${status}`,
      traceId,
    },
    status,
  };
}

export { AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION };
