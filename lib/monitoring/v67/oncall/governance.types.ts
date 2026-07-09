/**
 * V67 P5 — On-call & escalation governance types (read-only)
 */
import type { AlertSeverityTier } from "../alerting/taxonomy.types";
import type { EscalationStage } from "../incident/lifecycle.types";
import type { OncallTier } from "../foundation.types";

export const V67_ONCALL_GOVERNANCE_VERSION = "v67-oncall-governance-1" as const;

export type OncallShiftKind = "weekly" | "daily" | "follow-the-sun" | "declarative";

export type EscalationTriggerKind =
  | "timeout"
  | "severity"
  | "manual"
  | "slo-breach"
  | "lifecycle";

export type HandoffKind =
  | "shift-end"
  | "escalation"
  | "incident-transfer"
  | "role-delegation";

export type ResponseTargetKind = "acknowledge" | "mitigate" | "resolve" | "page";

export type OncallGovernanceSignals = {
  sloGovernanceReady?: boolean;
  rosterCatalogComplete?: boolean;
  escalationPolicyComplete?: boolean;
  responseTargetComplete?: boolean;
  handoffContractComplete?: boolean;
  foundationOncallAligned?: boolean;
};

export type OncallRosterEntry = {
  id: string;
  foundationRef: string;
  role: string;
  tier: OncallTier;
  shiftKind: OncallShiftKind;
  escalationMinutes: number;
  required: boolean;
  description: string;
};

export type OncallRosterManifest = {
  version: typeof V67_ONCALL_GOVERNANCE_VERSION;
  entryCount: number;
  tierCount: number;
  catalogComplete: boolean;
  roster: OncallRosterEntry[];
  summary: string;
};

export type EscalationPolicyEntry = {
  id: string;
  name: string;
  severityRef: AlertSeverityTier;
  fromStage: EscalationStage;
  toStage: EscalationStage;
  foundationOncallRef: string;
  triggerKind: EscalationTriggerKind;
  timeoutMinutes: number;
  lifecycleAction: string;
  required: boolean;
  description: string;
};

export type EscalationPolicyManifest = {
  version: typeof V67_ONCALL_GOVERNANCE_VERSION;
  policyCount: number;
  triggerKindCount: number;
  catalogComplete: boolean;
  policies: EscalationPolicyEntry[];
  summary: string;
};

export type ResponseTargetEntry = {
  id: string;
  severityRef: AlertSeverityTier;
  kind: ResponseTargetKind;
  targetMinutes: number;
  sloRef?: string;
  foundationOncallRef: string;
  pageRequired: boolean;
  required: boolean;
  description: string;
};

export type ResponseTargetManifest = {
  version: typeof V67_ONCALL_GOVERNANCE_VERSION;
  targetCount: number;
  kindCount: number;
  catalogComplete: boolean;
  targets: ResponseTargetEntry[];
  summary: string;
};

export type HandoffRule = {
  id: string;
  kind: HandoffKind;
  fromRole: string;
  toRole: string;
  fromFoundationRef: string;
  toFoundationRef: string;
  triggerCondition: string;
  requiredArtifacts: string[];
  required: boolean;
  description: string;
};

export type HandoffContractManifest = {
  version: typeof V67_ONCALL_GOVERNANCE_VERSION;
  ruleCount: number;
  kindCount: number;
  contractComplete: boolean;
  rules: HandoffRule[];
  summary: string;
};

export type OncallGovernanceReport = {
  version: typeof V67_ONCALL_GOVERNANCE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  sloGovernanceVersion: string;
  sloGovernanceReady: boolean;
  roster: OncallRosterManifest;
  escalationPolicy: EscalationPolicyManifest;
  responseTargets: ResponseTargetManifest;
  handoffContract: HandoffContractManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
