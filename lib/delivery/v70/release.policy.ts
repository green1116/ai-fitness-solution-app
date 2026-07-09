/**
 * V70 P3 — Release policy types (read-only)
 */

export const V70_RELEASE_POLICY_VERSION = "v70-release-policy-1" as const;
export const V70_RELEASE_POLICY_FREEZE_VERSION = "v70-release-policy-freeze-1" as const;

export type PolicyScope = "global" | "channel" | "stage" | "release";

export type PolicyConstraint =
  | "dependency-acyclic"
  | "catalog-complete"
  | "compatibility-match"
  | "approval-required"
  | "freeze-intact"
  | "verify-pass"
  | "rollback-defined";

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
  version: typeof V70_RELEASE_POLICY_VERSION;
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
  version: typeof V70_RELEASE_POLICY_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  checks: RequiredCheck[];
  summary: string;
};

export type PolicyException = {
  id: string;
  policyRuleRef: string;
  exceptionKind: string;
  status: "approved" | "rejected" | "pending" | "expired";
  required: boolean;
  description: string;
};

export type PolicyExceptionManifest = {
  version: typeof V70_RELEASE_POLICY_VERSION;
  entryCount: number;
  statusCount: number;
  catalogComplete: boolean;
  exceptions: PolicyException[];
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
  version: typeof V70_RELEASE_POLICY_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: AuditTrail[];
  summary: string;
};

export type ReleasePolicySignals = {
  releaseDependencyReady?: boolean;
  rulesComplete?: boolean;
  checksComplete?: boolean;
  exceptionsComplete?: boolean;
  auditTrailsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ReleasePolicyReport = {
  version: typeof V70_RELEASE_POLICY_VERSION;
  freezeVersion: typeof V70_RELEASE_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  releaseDependencyVersion: string;
  releaseDependencyReady: boolean;
  rules: PolicyRuleManifest;
  requiredChecks: RequiredCheckManifest;
  exceptions: PolicyExceptionManifest;
  auditTrails: AuditTrailManifest;
  policyReady: boolean;
  readinessScore: number;
  summary: string;
};
