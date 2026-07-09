/**
 * V71 P3 — Workflow policy types (read-only)
 */

export const V71_WORKFLOW_POLICY_VERSION = "v71-workflow-policy-1" as const;
export const V71_WORKFLOW_POLICY_FREEZE_VERSION = "v71-workflow-policy-freeze-1" as const;

export type PolicyScope = "global" | "workflow" | "trigger" | "action";

export type PolicyConstraint =
  | "dependency-acyclic"
  | "catalog-complete"
  | "timeout-defined"
  | "retry-bounded"
  | "trigger-allowed"
  | "step-order-valid"
  | "freeze-intact"
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
  version: typeof V71_WORKFLOW_POLICY_VERSION;
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
  version: typeof V71_WORKFLOW_POLICY_VERSION;
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
  version: typeof V71_WORKFLOW_POLICY_VERSION;
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
  version: typeof V71_WORKFLOW_POLICY_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: AuditTrail[];
  summary: string;
};

export type WorkflowPolicySignals = {
  workflowDependencyReady?: boolean;
  rulesComplete?: boolean;
  checksComplete?: boolean;
  exceptionsComplete?: boolean;
  auditTrailsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type WorkflowPolicyReport = {
  version: typeof V71_WORKFLOW_POLICY_VERSION;
  freezeVersion: typeof V71_WORKFLOW_POLICY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  workflowDependencyVersion: string;
  workflowDependencyReady: boolean;
  rules: PolicyRuleManifest;
  requiredChecks: RequiredCheckManifest;
  exceptions: PolicyExceptionManifest;
  auditTrails: AuditTrailManifest;
  policyReady: boolean;
  readinessScore: number;
  summary: string;
};
