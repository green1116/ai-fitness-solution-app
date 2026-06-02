import type { OrchestrationAuditRecord, OrchestrationPlan, OrchestrationReadinessProfile } from "./types";
import type { OrchestrateBridgeDispatchResult } from "./orchestrate";

export function auditOrchestration(input: {
  deploymentId: string;
  plan: OrchestrationPlan;
  readinessProfiles: OrchestrationReadinessProfile[];
  dispatch: OrchestrateBridgeDispatchResult;
  gateState: string;
}): OrchestrationAuditRecord[] {
  const now = new Date().toISOString();
  const records: OrchestrationAuditRecord[] = [];

  records.push({
    recordId: `orch-audit-gate-${input.deploymentId}`,
    intentId: "*",
    phase: "gate",
    action: "buildBridgeGate",
    outcome: input.plan.admittedIntentIds.length > 0 ? "pass" : "fail",
    detail: `gate=${input.gateState} admitted=${input.plan.admittedIntentIds.length} blocked=${input.plan.blockedIntentIds.length}`,
    timestamp: now,
  });

  for (const profile of input.readinessProfiles) {
    records.push({
      recordId: `orch-audit-readiness-${profile.intentId}`,
      intentId: profile.intentId,
      phase: "readiness",
      action: "evaluateOrchestrationReadiness",
      outcome: profile.admitted && profile.liveReady ? "pass" : profile.admitted ? "skip" : "fail",
      detail: profile.detail,
      timestamp: now,
    });
  }

  for (const step of input.plan.steps) {
    records.push({
      recordId: `orch-audit-step-${step.intentId}`,
      intentId: step.intentId,
      phase: "orchestration",
      action: "orchestrateCommandFlow",
      outcome:
        step.status === "blocked" || step.status === "skipped" ? "fail"
        : step.status === "dispatched" || step.status === "ready" ? "pass"
        : "skip",
      detail: `${step.status} mode=${step.mode}`,
      timestamp: now,
    });
  }

  const dispatchCount =
    input.dispatch.filteredDispatches.execution.length +
    input.dispatch.filteredDispatches.change.length +
    input.dispatch.filteredDispatches.incident.length +
    input.dispatch.filteredDispatches.recovery.length;

  records.push({
    recordId: `orch-audit-dispatch-${input.deploymentId}`,
    intentId: "*",
    phase: "dispatch",
    action: "orchestrateBridgeDispatch",
    outcome: input.dispatch.dispatchedIntentIds.length > 0 ? "pass" : "skip",
    detail: `plans=${input.dispatch.filteredPlans.length} dispatches=${dispatchCount} dispatchedIntents=${input.dispatch.dispatchedIntentIds.length}`,
    timestamp: now,
  });

  const summaryRecord: OrchestrationAuditRecord = {
    recordId: `orch-audit-summary-${input.deploymentId}`,
    intentId: "*",
    phase: "audit",
    action: "auditOrchestration",
    outcome: "pass",
    detail: "",
    timestamp: now,
  };
  summaryRecord.detail = `records=${records.length + 1}`;
  records.push(summaryRecord);

  return records;
}
