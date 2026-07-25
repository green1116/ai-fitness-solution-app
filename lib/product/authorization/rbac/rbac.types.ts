/**
 * Product Authorization — RBAC readiness / manifest types
 */

import type {
  AUTHORIZATION_MANAGER_STATUSES,
  AUTHORIZATION_READINESS_VERDICTS,
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
} from "./rbac.constants";

export type AuthorizationReadinessVerdict =
  (typeof AUTHORIZATION_READINESS_VERDICTS)[number];
export type AuthorizationManagerStatus =
  (typeof AUTHORIZATION_MANAGER_STATUSES)[number];

export type AuthorizationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AuthorizationReadinessResult = {
  verdict: AuthorizationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AuthorizationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AuthorizationRegistryManifest = {
  foundationId: typeof PRODUCT_AUTHORIZATION_RBAC_ID;
  version: typeof PRODUCT_AUTHORIZATION_RBAC_VERSION;
  freezeVersion: typeof PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION;
  base: typeof PRODUCT_AUTHORIZATION_RBAC_BASE;
  roleCount: number;
  permissionCount: number;
  grantCount: number;
  assignmentCount: number;
  decisionCount: number;
};
