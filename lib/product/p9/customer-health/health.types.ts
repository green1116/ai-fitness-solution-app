/**
 * Product P9 — Customer health types + readiness / manifest
 */

import type {
  HEALTH_STATUSES,
  P9_MANAGER_STATUSES,
  P9_READINESS_VERDICTS,
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
} from "./health.constants";

export type HealthStatus = (typeof HEALTH_STATUSES)[number];
export type P9ReadinessVerdict = (typeof P9_READINESS_VERDICTS)[number];
export type P9ManagerStatus = (typeof P9_MANAGER_STATUSES)[number];
export type HealthMetadata = Record<string, unknown>;

export type CustomerHealth = {
  id: string;
  accountRef: string;
  tenderRef: string;
  score: number;
  status: HealthStatus;
  owner: string;
  detail: string;
  metadata: HealthMetadata;
  assessedAt: string;
  updatedAt: string;
};

export type CreateCustomerHealthInput = {
  id?: string;
  accountRef: string;
  tenderRef: string;
  score: number;
  owner: string;
  metadata?: HealthMetadata;
};

export type UpdateCustomerHealthInput = {
  healthId: string;
  score?: number;
  status?: HealthStatus;
};

export type P9ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P9ReadinessResult = {
  verdict: P9ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P9ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P9RegistryManifest = {
  foundationId: typeof PRODUCT_P9_CUSTOMER_SUCCESS_ID;
  version: typeof PRODUCT_P9_CUSTOMER_SUCCESS_VERSION;
  freezeVersion: typeof PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION;
  base: typeof PRODUCT_P9_CUSTOMER_SUCCESS_BASE;
  healthCount: number;
  usageCount: number;
  feedbackCount: number;
  satisfactionCount: number;
  successPlanCount: number;
  renewalCount: number;
  expansionCount: number;
};
