/**
 * Product Identity — Authentication types + readiness / manifest
 */

import type {
  AUTH_STATUSES,
  IDENTITY_MANAGER_STATUSES,
  IDENTITY_READINESS_VERDICTS,
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
} from "./authentication.constants";

export type AuthStatus = (typeof AUTH_STATUSES)[number];
export type IdentityReadinessVerdict =
  (typeof IDENTITY_READINESS_VERDICTS)[number];
export type IdentityManagerStatus =
  (typeof IDENTITY_MANAGER_STATUSES)[number];
export type AuthMetadata = Record<string, unknown>;

export type AuthenticationRecord = {
  id: string;
  principalId: string;
  status: AuthStatus;
  method: string;
  detail: string;
  metadata: AuthMetadata;
  authenticatedAt: string;
  updatedAt: string;
};

export type AuthenticateInput = {
  id?: string;
  principalId: string;
  method?: string;
  metadata?: AuthMetadata;
};

export type UpdateAuthStatusInput = {
  authId: string;
  status: AuthStatus;
};

export type IdentityReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IdentityReadinessResult = {
  verdict: IdentityReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IdentityReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IdentityRegistryManifest = {
  foundationId: typeof PRODUCT_IDENTITY_FOUNDATION_ID;
  version: typeof PRODUCT_IDENTITY_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_IDENTITY_FOUNDATION_BASE;
  authCount: number;
  principalCount: number;
  credentialCount: number;
  sessionCount: number;
  tokenCount: number;
  accessCount: number;
};
