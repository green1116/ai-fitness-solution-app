/**
 * Product P8 — Tender types + readiness / manifest
 */

import type {
  P8_MANAGER_STATUSES,
  P8_READINESS_VERDICTS,
  PRODUCT_P8_TENDER_DELIVERY_BASE,
  PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION,
  PRODUCT_P8_TENDER_DELIVERY_ID,
  PRODUCT_P8_TENDER_DELIVERY_VERSION,
  TENDER_STATUSES,
} from "./tender.constants";

export type TenderStatus = (typeof TENDER_STATUSES)[number];
export type P8ReadinessVerdict = (typeof P8_READINESS_VERDICTS)[number];
export type P8ManagerStatus = (typeof P8_MANAGER_STATUSES)[number];
export type TenderMetadata = Record<string, unknown>;

export type TenderCase = {
  id: string;
  collaborationRef: string;
  title: string;
  owner: string;
  status: TenderStatus;
  detail: string;
  metadata: TenderMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateTenderInput = {
  id?: string;
  collaborationRef: string;
  title: string;
  owner: string;
  metadata?: TenderMetadata;
};

export type UpdateTenderStatusInput = {
  tenderId: string;
  status: TenderStatus;
};

export type P8ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P8ReadinessResult = {
  verdict: P8ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P8ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P8RegistryManifest = {
  foundationId: typeof PRODUCT_P8_TENDER_DELIVERY_ID;
  version: typeof PRODUCT_P8_TENDER_DELIVERY_VERSION;
  freezeVersion: typeof PRODUCT_P8_TENDER_DELIVERY_FREEZE_VERSION;
  base: typeof PRODUCT_P8_TENDER_DELIVERY_BASE;
  tenderCount: number;
  deliveryCount: number;
  documentCount: number;
  exportCount: number;
  packageCount: number;
  submissionCount: number;
  trackingCount: number;
  handoverCount: number;
};
