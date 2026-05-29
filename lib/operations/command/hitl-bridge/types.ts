import type { AutonomousCommandRuntimeResult } from "../types";
import type { HumanInTheLoopCommandRuntimeResult } from "../hitl/types";
import type { AutonomousCommandExecutionRuntimeResult } from "../bridge/types";

export const HITL_BRIDGE_COORDINATION_VERSION = "v4-a5-a3-hitl-bridge-coordination-1" as const;
export type HITLBridgeCoordinationVersion = typeof HITL_BRIDGE_COORDINATION_VERSION;

export type EligibilityReason =
  | "approved"
  | "overridden"
  | "escalated-approved"
  | "auto-cleared"
  | "rejected"
  | "cancelled"
  | "suspended"
  | "rollback-request-pending"
  | "rollback-request-cleared"
  | "pending-review"
  | "policy-denied"
  | "not-queued";

export type BridgeEligibilityProfile = {
  profileId: string;
  intentId: string;
  eligible: boolean;
  reason: EligibilityReason;
  reviewStatus: string | null;
  hitlCleared: boolean;
};

export type BridgeAdmissionOutcome = "admit" | "block";

export type BridgeAdmissionDecision = {
  decisionId: string;
  intentId: string;
  outcome: BridgeAdmissionOutcome;
  reason: EligibilityReason;
  operator: string;
  timestamp: string;
};

export type BridgeGateState = "open" | "closed" | "partial";

export type BridgeGate = {
  gateId: string;
  deploymentId: string;
  state: BridgeGateState;
  admittedIntentIds: string[];
  blockedIntentIds: string[];
  openDomains: string[];
  summary: string;
};

export type DispatchReadinessStatus = "ready" | "not-ready" | "partial" | "blocked";

export type DispatchReadiness = {
  readinessId: string;
  intentId: string;
  status: DispatchReadinessStatus;
  bridgePlanReady: boolean;
  hitlCleared: boolean;
  detail: string;
};

export type AdmissionAuditRecord = {
  recordId: string;
  intentId: string;
  phase: "eligibility" | "admission" | "gate" | "readiness";
  action: string;
  outcome: "pass" | "fail" | "skip";
  detail: string;
  timestamp: string;
};

export type HITLBridgeCoordinationRuntimeInput = {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  hitl: HumanInTheLoopCommandRuntimeResult;
  bridge?: AutonomousCommandExecutionRuntimeResult;
};

export type HITLBridgeCoordinationRuntimeResult = {
  version: HITLBridgeCoordinationVersion;
  eligibilityProfiles: BridgeEligibilityProfile[];
  admissionDecisions: BridgeAdmissionDecision[];
  gate: BridgeGate;
  dispatchReadiness: DispatchReadiness[];
  admissionAudit: AdmissionAuditRecord[];
  admittedIntentIds: string[];
  blockedIntentIds: string[];
  flags: {
    eligibility: boolean;
    admission: boolean;
    gate: boolean;
    readiness: boolean;
    audit: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: "open" | "partial" | "closed" | "idle";
};
