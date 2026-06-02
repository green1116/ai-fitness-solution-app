export * from "./types";
export * from "./eligibility";
export * from "./admission";
export * from "./gate";
export * from "./readiness";
export * from "./audit";

import {
  HITL_BRIDGE_COORDINATION_VERSION,
  type HITLBridgeCoordinationRuntimeInput,
  type HITLBridgeCoordinationRuntimeResult,
} from "./types";
import { evaluateBridgeEligibilities } from "./eligibility";
import { resolveAdmissionDecisions } from "./admission";
import { buildBridgeGate } from "./gate";
import { evaluateDispatchReadinessBatch } from "./readiness";
import { buildAdmissionAuditRecords } from "./audit";

export type HITLBridgeCoordinationRuntime = HITLBridgeCoordinationRuntimeResult;

export function buildHITLBridgeCoordinationRuntime(
  input: HITLBridgeCoordinationRuntimeInput,
): HITLBridgeCoordinationRuntimeResult {
  const eligibilityProfiles = evaluateBridgeEligibilities({
    deploymentId: input.deploymentId,
    command: input.command,
    hitl: input.hitl,
  });

  const admissionDecisions = resolveAdmissionDecisions({
    deploymentId: input.deploymentId,
    profiles: eligibilityProfiles,
    operator: "hitl-admission-controller",
  });

  const gate = buildBridgeGate({
    deploymentId: input.deploymentId,
    command: input.command,
    admissionDecisions,
  });

  const dispatchReadiness = evaluateDispatchReadinessBatch({
    deploymentId: input.deploymentId,
    profiles: eligibilityProfiles,
    admissions: admissionDecisions,
    bridge: input.bridge,
  });

  const admissionAudit = buildAdmissionAuditRecords({
    deploymentId: input.deploymentId,
    profiles: eligibilityProfiles,
    admissions: admissionDecisions,
    gate,
    readiness: dispatchReadiness,
  });

  const admittedIntentIds = gate.admittedIntentIds;
  const blockedIntentIds = gate.blockedIntentIds;

  let status: HITLBridgeCoordinationRuntimeResult["status"] = "closed";
  if (gate.state === "open") status = "open";
  else if (gate.state === "partial") status = "partial";
  else if (input.command.intents.length === 0) status = "idle";

  const readyCount = dispatchReadiness.filter((r) => r.status === "ready").length;

  return {
    version: HITL_BRIDGE_COORDINATION_VERSION,
    eligibilityProfiles,
    admissionDecisions,
    gate,
    dispatchReadiness,
    admissionAudit,
    admittedIntentIds,
    blockedIntentIds,
    flags: {
      eligibility: eligibilityProfiles.length > 0,
      admission: admissionDecisions.length > 0,
      gate: gate.admittedIntentIds.length + gate.blockedIntentIds.length > 0,
      readiness: dispatchReadiness.length > 0,
      audit: admissionAudit.length > 0,
    },
    summary: {
      summaryId: `hitl-bridge-coordination-summary-${input.deploymentId}`,
      text: `gate=${gate.state} admitted=${admittedIntentIds.length} blocked=${blockedIntentIds.length} ready=${readyCount} audit=${admissionAudit.length}`,
      traceId: `hitl-bridge-trace-${input.deploymentId}`,
    },
    status,
  };
}
