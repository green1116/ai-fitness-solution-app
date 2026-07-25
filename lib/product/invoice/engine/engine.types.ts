/**
 * Product Invoice — readiness / manifest types
 */

import type {
  INVOICE_MANAGER_STATUSES,
  INVOICE_READINESS_VERDICTS,
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
} from "./engine.constants";

export type InvoiceReadinessVerdict =
  (typeof INVOICE_READINESS_VERDICTS)[number];
export type InvoiceManagerStatus = (typeof INVOICE_MANAGER_STATUSES)[number];

export type InvoiceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type InvoiceReadinessResult = {
  verdict: InvoiceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: InvoiceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type InvoiceRegistryManifest = {
  foundationId: typeof PRODUCT_INVOICE_ENGINE_ID;
  version: typeof PRODUCT_INVOICE_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_INVOICE_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_INVOICE_ENGINE_BASE;
  documentCount: number;
  lineCount: number;
  taxCount: number;
  settlementCount: number;
};
