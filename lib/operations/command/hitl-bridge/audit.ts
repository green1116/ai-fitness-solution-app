import type {
  AdmissionAuditRecord,
  BridgeAdmissionDecision,
  BridgeEligibilityProfile,
  BridgeGate,
  DispatchReadiness,
} from "./types";

export function buildAdmissionAuditRecords(input: {
  deploymentId: string;
  profiles: BridgeEligibilityProfile[];
  admissions: BridgeAdmissionDecision[];
  gate: BridgeGate;
  readiness: DispatchReadiness[];
}): AdmissionAuditRecord[] {
  const now = new Date().toISOString();
  const records: AdmissionAuditRecord[] = [];

  for (const profile of input.profiles) {
    records.push({
      recordId: `audit-eligibility-${profile.intentId}`,
      intentId: profile.intentId,
      phase: "eligibility",
      action: "evaluateBridgeEligibility",
      outcome: profile.eligible ? "pass" : "fail",
      detail: `reason=${profile.reason} review=${profile.reviewStatus ?? "none"}`,
      timestamp: now,
    });
  }

  for (const admission of input.admissions) {
    records.push({
      recordId: `audit-admission-${admission.intentId}`,
      intentId: admission.intentId,
      phase: "admission",
      action: admission.outcome === "admit" ? "admitToExecutionBridge" : "blockFromExecutionBridge",
      outcome: admission.outcome === "admit" ? "pass" : "fail",
      detail: admission.reason,
      timestamp: now,
    });
  }

  records.push({
    recordId: `audit-gate-${input.deploymentId}`,
    intentId: "*",
    phase: "gate",
    action: "buildBridgeGate",
    outcome: input.gate.state === "closed" ? "fail" : "pass",
    detail: input.gate.summary,
    timestamp: now,
  });

  for (const ready of input.readiness) {
    records.push({
      recordId: `audit-readiness-${ready.intentId}`,
      intentId: ready.intentId,
      phase: "readiness",
      action: "evaluateDispatchReadiness",
      outcome: ready.status === "ready" ? "pass" : ready.status === "blocked" ? "fail" : "skip",
      detail: ready.detail,
      timestamp: now,
    });
  }

  return records;
}
