import type { GovernanceActionCandidate, GovernanceRuleCategory, GovernanceSeverityLevel } from "./types";

export const GOVERNANCE_RULEBOOK_VERSION = "v4-a3-r2-rulebook-1" as const;
export type GovernanceRulebookVersion = typeof GOVERNANCE_RULEBOOK_VERSION;

export type GovernanceRulebookCategory = GovernanceRuleCategory;

export type GovernanceRulebookThreshold =
  | { type: "number"; operator: "gte" | "lte" | "gt" | "lt" | "eq"; value: number }
  | { type: "level"; allowed: readonly ("low" | "medium" | "high" | "critical")[] }
  | { type: "enum"; allowed: readonly string[] }
  | { type: "keywords"; words: readonly string[] }
  | { type: "boolean"; value: boolean };

export type GovernanceRulebookTrigger = {
  field: "priority" | "confidence" | "title" | "kind" | "evidenceCount";
  threshold: GovernanceRulebookThreshold;
  scope: GovernanceActionCandidate["kind"] | "any";
};

export type GovernanceRulebookAction = {
  to: "controls" | "approvals" | "escalation" | "exceptions" | "auditTrail" | "governanceSummary";
  label: string;
};

export type GovernanceRulebookEntry = {
  ruleId: string;
  ruleName: string;
  category: GovernanceRulebookCategory;
  enabled: boolean;
  priority: number;
  severity: GovernanceSeverityLevel;
  description: string;
  rationale: string;
  triggerReason: string;
  triggers: GovernanceRulebookTrigger[];
  actions: GovernanceRulebookAction[];
};

export type GovernanceRulebook = {
  rulebookId: string;
  version: GovernanceRulebookVersion;
  entries: GovernanceRulebookEntry[];
};

export type GovernanceRulebookMatch = {
  ruleId: string;
  matched: boolean;
  reason: string;
  candidateIds: string[];
  actions: GovernanceRulebookAction[];
};

export type GovernanceRulebookConflictResolution = {
  actionTarget: GovernanceRulebookAction["to"];
  winningRuleId: string;
  suppressedRuleIds: string[];
  reason: string;
};

export type GovernanceRulebookEvaluation = {
  version: GovernanceRulebookVersion;
  matches: GovernanceRulebookMatch[];
  conflictResolutions: GovernanceRulebookConflictResolution[];
  governanceScore: number;
  governanceConfidence: "low" | "medium" | "high";
};

export type GovernanceRulebookRegistry = {
  loadedAt: string;
  rulebooks: GovernanceRulebook[];
  activeVersion: GovernanceRulebookVersion;
};

export type GovernanceRulebookSnapshot = {
  rulebookId: string;
  version: GovernanceRulebookVersion;
  enabledRuleCount: number;
  categoryCounts: Record<GovernanceRulebookCategory, number>;
};
