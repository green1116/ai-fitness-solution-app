/**
 * Product Session — readiness / manifest types
 */

import type {
  PRODUCT_SESSION_CONTROL_BASE,
  PRODUCT_SESSION_CONTROL_FREEZE_VERSION,
  PRODUCT_SESSION_CONTROL_ID,
  PRODUCT_SESSION_CONTROL_VERSION,
  SESSION_MANAGER_STATUSES,
  SESSION_READINESS_VERDICTS,
} from "./control.constants";

export type SessionReadinessVerdict =
  (typeof SESSION_READINESS_VERDICTS)[number];
export type SessionManagerStatus =
  (typeof SESSION_MANAGER_STATUSES)[number];

export type SessionReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SessionReadinessResult = {
  verdict: SessionReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SessionReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SessionRegistryManifest = {
  foundationId: typeof PRODUCT_SESSION_CONTROL_ID;
  version: typeof PRODUCT_SESSION_CONTROL_VERSION;
  freezeVersion: typeof PRODUCT_SESSION_CONTROL_FREEZE_VERSION;
  base: typeof PRODUCT_SESSION_CONTROL_BASE;
  sessionCount: number;
  tokenCount: number;
  refreshCount: number;
  validationCount: number;
};
