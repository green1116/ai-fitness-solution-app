/**
 * Product User — readiness / manifest types
 */

import type {
  PRODUCT_USER_ADMINISTRATION_BASE,
  PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_USER_ADMINISTRATION_ID,
  PRODUCT_USER_ADMINISTRATION_VERSION,
  USER_MANAGER_STATUSES,
  USER_READINESS_VERDICTS,
} from "./administration.constants";

export type UserReadinessVerdict = (typeof USER_READINESS_VERDICTS)[number];
export type UserManagerStatus = (typeof USER_MANAGER_STATUSES)[number];

export type UserReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type UserReadinessResult = {
  verdict: UserReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: UserReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type UserRegistryManifest = {
  administrationId: typeof PRODUCT_USER_ADMINISTRATION_ID;
  version: typeof PRODUCT_USER_ADMINISTRATION_VERSION;
  freezeVersion: typeof PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION;
  base: typeof PRODUCT_USER_ADMINISTRATION_BASE;
  accountCount: number;
  membershipCount: number;
  privilegeCount: number;
  lifecycleCount: number;
};
