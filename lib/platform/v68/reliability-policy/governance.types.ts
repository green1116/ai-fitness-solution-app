/**
 * V68 P6 — Reliability policy types (read-only)
 */

export const V68_RELIABILITY_POLICY_VERSION = "v68-reliability-policy-1" as const;

export type ReliabilityObjectiveKind = "availability" | "latency" | "mttr" | "error-budget";

export type FailureSeverityTier = "sev-0" | "sev-1" | "sev-2" | "sev-3" | "sev-4";

export type DegradationKind = "circuit-break" | "throttle" | "fallback" | "read-only" | "feature-disable";

export type RecoveryKind = "auto-retry" | "rollback" | "failover" | "manual-runbook" | "postmortem";

export type ReliabilityPolicySignals = {
  capacityPlanningReady?: boolean;
  objectiveCatalogComplete?: boolean;
  failureSeverityComplete?: boolean;
  degradationStrategyComplete?: boolean;
  recoveryStrategyComplete?: boolean;
  refsAligned?: boolean;
};

export type ReliabilityObjectiveEntry = {
  id: string;
  serviceDefRef: string;
  kind: ReliabilityObjectiveKind;
  target: number;
  unit: string;
  window: string;
  required: boolean;
  description: string;
};

export type ReliabilityObjectiveManifest = {
  version: typeof V68_RELIABILITY_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  objectives: ReliabilityObjectiveEntry[];
  summary: string;
};

export type FailureSeverityEntry = {
  id: string;
  tier: FailureSeverityTier;
  label: string;
  alertSeverityRef: string;
  impactLevel: "critical" | "high" | "medium" | "low" | "info";
  required: boolean;
  description: string;
};

export type FailureSeverityManifest = {
  version: typeof V68_RELIABILITY_POLICY_VERSION;
  entryCount: number;
  tierCount: number;
  catalogComplete: boolean;
  severities: FailureSeverityEntry[];
  summary: string;
};

export type DegradationStrategyEntry = {
  id: string;
  serviceDefRef: string;
  failureRef: string;
  kind: DegradationKind;
  triggerCondition: string;
  flagRef?: string;
  required: boolean;
  description: string;
};

export type DegradationStrategyManifest = {
  version: typeof V68_RELIABILITY_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  strategies: DegradationStrategyEntry[];
  summary: string;
};

export type RecoveryStrategyEntry = {
  id: string;
  serviceDefRef: string;
  failureRef: string;
  kind: RecoveryKind;
  rtoMinutes: number;
  runbookRef?: string;
  required: boolean;
  description: string;
};

export type RecoveryStrategyManifest = {
  version: typeof V68_RELIABILITY_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  strategies: RecoveryStrategyEntry[];
  summary: string;
};

export type ReliabilityPolicyReport = {
  version: typeof V68_RELIABILITY_POLICY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  capacityPlanningVersion: string;
  capacityPlanningReady: boolean;
  objectives: ReliabilityObjectiveManifest;
  failureSeverities: FailureSeverityManifest;
  degradationStrategies: DegradationStrategyManifest;
  recoveryStrategies: RecoveryStrategyManifest;
  policyReady: boolean;
  readinessScore: number;
  summary: string;
};
