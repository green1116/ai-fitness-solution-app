/**
 * Operations O1 — Renewal types + readiness / manifest
 */

import type {
  O1_MANAGER_STATUSES,
  O1_READINESS_VERDICTS,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
  RENEWAL_STATUSES,
} from "../success/success.constants";

export type RenewalStatus = (typeof RENEWAL_STATUSES)[number];
export type O1ReadinessVerdict = (typeof O1_READINESS_VERDICTS)[number];
export type O1ManagerStatus = (typeof O1_MANAGER_STATUSES)[number];
export type RenewalMetadata = Record<string, unknown>;

export type RenewalRecord = {
  id: string;
  customerId: string;
  status: RenewalStatus;
  amount: number;
  termMonths: number;
  detail: string;
  metadata: RenewalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRenewalInput = {
  id?: string;
  customerId: string;
  status?: RenewalStatus;
  amount: number;
  termMonths?: number;
  metadata?: RenewalMetadata;
};

export type UpdateRenewalStatusInput = {
  renewalId: string;
  status: RenewalStatus;
  note?: string;
};

export type O1ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type O1ReadinessResult = {
  verdict: O1ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: O1ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type O1RegistryManifest = {
  foundationId: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID;
  version: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION;
  freezeVersion: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION;
  base: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE;
  customerCount: number;
  metricsCount: number;
  healthScoreCount: number;
  planCount: number;
  trackingCount: number;
  feedbackCount: number;
  analysisCount: number;
  renewalCount: number;
};
