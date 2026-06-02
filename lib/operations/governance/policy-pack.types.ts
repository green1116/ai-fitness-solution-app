import type { OperationalIntelligenceRuntime } from "../intelligence";
import type { GovernanceRulebookEvaluation } from "./rulebook.types";
import type {
  GovernanceActionCandidate,
  GovernanceConfidenceLevel,
  GovernanceRuleEvaluation,
} from "./types";

export const GOVERNANCE_POLICY_PACK_VERSION = "v4-a3-r3-policy-pack-1" as const;
export type GovernancePolicyPackVersion = typeof GOVERNANCE_POLICY_PACK_VERSION;

export type GovernancePolicyPackMode =
  | "strict"
  | "standard"
  | "relaxed"
  | "audit"
  | "emergency";

export type GovernancePolicyPackEnvironment =
  | "production"
  | "staging"
  | "internal"
  | "any";

export type GovernancePolicyPackRiskLevel = "high" | "low" | "any";

export type GovernancePolicyPackProfile = {
  approvalThreshold: number;
  escalationThreshold: number;
  exceptionTolerance: "low" | "medium" | "high";
  auditDepth: "minimal" | "standard" | "deep";
  confidenceFloor: number;
  controlStrictness: "low" | "medium" | "high";
};

export type GovernancePolicyPackThreshold = {
  field: "confidence" | "priority" | "evidenceCount";
  adjustment: "raise" | "lower" | "none";
  delta: number;
};

export type GovernancePolicyPackOverride = {
  overrideId: string;
  target: "approval" | "escalation" | "exception" | "audit" | "score" | "confidence";
  action: "boost" | "reduce" | "require" | "defer" | "record";
  reason: string;
  ruleId?: string;
};

export type GovernancePolicyPack = {
  packId: string;
  version: GovernancePolicyPackVersion;
  mode: GovernancePolicyPackMode;
  environment: GovernancePolicyPackEnvironment;
  riskLevel: GovernancePolicyPackRiskLevel;
  enabled: boolean;
  description: string;
  rationale: string;
  profile: GovernancePolicyPackProfile;
  enabledRuleIds: readonly string[] | "all";
  rulePriorityAdjustments: Readonly<Record<string, number>>;
  thresholdOverrides: readonly GovernancePolicyPackThreshold[];
};

export type GovernancePolicyPackMatch = {
  packId: string;
  matched: boolean;
  reason: string;
  score: number;
};

export type GovernancePolicyPackTrace = {
  traceId: string;
  packId: string;
  mode: GovernancePolicyPackMode;
  matched: boolean;
  reason: string;
};

export type GovernancePolicyPackEvaluation = {
  version: GovernancePolicyPackVersion;
  selectedPackId: string;
  mode: GovernancePolicyPackMode;
  matches: GovernancePolicyPackMatch[];
  overrides: GovernancePolicyPackOverride[];
  traces: GovernancePolicyPackTrace[];
  adjustedRuleEvaluation: GovernanceRuleEvaluation;
  governanceScore: number;
  governanceConfidence: GovernanceConfidenceLevel;
};

export type GovernancePolicyPackRegistry = {
  loadedAt: string;
  packs: GovernancePolicyPack[];
  activeVersion: GovernancePolicyPackVersion;
  defaultMode: GovernancePolicyPackMode;
};

export type GovernancePolicyPackSnapshot = {
  packId: string;
  version: GovernancePolicyPackVersion;
  mode: GovernancePolicyPackMode;
  environment: GovernancePolicyPackEnvironment;
  enabledPackCount: number;
  modeCounts: Record<GovernancePolicyPackMode, number>;
};

export type GovernancePolicyPackSelectionContext = {
  deploymentId: string;
  intelligence?: OperationalIntelligenceRuntime;
  candidates: GovernanceActionCandidate[];
  rulebookEvaluation: GovernanceRulebookEvaluation;
};
