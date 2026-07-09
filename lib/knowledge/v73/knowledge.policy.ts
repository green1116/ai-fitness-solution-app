/**
 * V73 P3 — Knowledge policy types (read-only)
 */

export const V73_KNOWLEDGE_POLICY_VERSION = "v73-knowledge-policy-1" as const;
export const V73_KNOWLEDGE_POLICY_FREEZE_VERSION = "v73-knowledge-policy-freeze-1" as const;

export type PolicyScope = "global" | "document" | "topic" | "category";

export type PolicyConstraint =
  | "dependency-acyclic"
  | "catalog-complete"
  | "confidence-threshold"
  | "access-gate"
  | "source-valid"
  | "version-match"
  | "tag-required"
  | "verify-pass";

export type PolicyEnforcement = "declarative" | "gate" | "audit-only";

export type PolicyRule = {
  id: string;
  scope: PolicyScope;
  scopeRef: string;
  constraint: PolicyConstraint;
  allowed: string[];
  blocked: string[];
  requiredCheck: string;
  exception: string;
  enforcement: PolicyEnforcement;
  auditTrail: string;
  required: boolean;
  description: string;
};

export type PolicyRuleManifest = {
  version: typeof V73_KNOWLEDGE_POLICY_VERSION;
  ruleCount: number;
  scopeCount: number;
  catalogComplete: boolean;
  rules: PolicyRule[];
  summary: string;
};

export type RequiredCheck = {
  id: string;
  policyRuleRef: string;
  checkKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type RequiredCheckManifest = {
  version: typeof V73_KNOWLEDGE_POLICY_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  checks: RequiredCheck[];
  summary: string;
};

export type Exception = {
  id: string;
  policyRuleRef: string;
  exceptionKind: string;
  status: "approved" | "rejected" | "pending" | "expired";
  required: boolean;
  description: string;
};

export type ExceptionManifest = {
  version: typeof V73_KNOWLEDGE_POLICY_VERSION;
  entryCount: number;
  statusCount: number;
  catalogComplete: boolean;
  exceptions: Exception[];
  summary: string;
};

export type AuditTrail = {
  id: string;
  policyRuleRef: string;
  event: string;
  retention: string;
  required: boolean;
  description: string;
};

export type AuditTrailManifest = {
  version: typeof V73_KNOWLEDGE_POLICY_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: AuditTrail[];
  summary: string;
};

export type KnowledgePolicySignals = {
  knowledgeDependencyReady?: boolean;
  rulesComplete?: boolean;
  checksComplete?: boolean;
  exceptionsComplete?: boolean;
  auditTrailsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgePolicyReport = {
  version: typeof V73_KNOWLEDGE_POLICY_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgeDependencyVersion: string;
  knowledgeDependencyReady: boolean;
  rules: PolicyRuleManifest;
  requiredChecks: RequiredCheckManifest;
  exceptions: ExceptionManifest;
  auditTrails: AuditTrailManifest;
  policyReady: boolean;
  readinessScore: number;
  summary: string;
};
