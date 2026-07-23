/**
 * Launch L3 — Security types
 */

import type {
  SECURITY_CHECK_RESULTS,
  SECURITY_POLICY_SCOPES,
} from "../runtime/runtime.constants";

export type SecurityPolicyScope = (typeof SECURITY_POLICY_SCOPES)[number];
export type SecurityCheckResult = (typeof SECURITY_CHECK_RESULTS)[number];
export type SecurityMetadata = Record<string, unknown>;

export type SecurityPolicy = {
  id: string;
  runtimeId: string;
  name: string;
  scope: SecurityPolicyScope;
  enforced: boolean;
  detail: string;
  metadata: SecurityMetadata;
  createdAt: string;
};

export type DefineSecurityPolicyInput = {
  id?: string;
  runtimeId: string;
  name: string;
  scope: SecurityPolicyScope;
  enforced?: boolean;
  metadata?: SecurityMetadata;
};

export type SecurityCheck = {
  id: string;
  policyId: string;
  name: string;
  result: SecurityCheckResult;
  detail: string;
  checkedAt: string;
};

export type RunSecurityCheckInput = {
  id?: string;
  policyId: string;
  name: string;
  result: SecurityCheckResult;
};
