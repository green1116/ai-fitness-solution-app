import type { QuoteSnapshot } from "@/lib/commercial-products/access-layer/shared/types";

export const DELIVERABLE_PACKAGE_VERSION = "v47-commercial-products-p2-step5" as const;
export const CP_PACKAGE_API_PATH = "/api/commercial-products/package" as const;

export interface DeliverablePackageRequest {
  quoteId: string;
  planId?: string;
  budgetId?: string;
  snapshot?: QuoteSnapshot;
}

export interface DeliverablePackageFile {
  name: string;
  mimeType: "application/pdf" | "application/json" | "text/plain";
  byteLength: number;
}

export interface DeliverablePackageManifest {
  quoteId: string;
  planId: string;
  budgetId: string;
  generatedAt: string;
  includedFiles: string[];
  version: string;
  sku?: string;
  projectName?: string;
}

export interface DeliverablePackageResult {
  filename: string;
  mimeType: "application/zip";
  buffer: Uint8Array;
  source: "deliverable-package";
  files: DeliverablePackageFile[];
  manifest: DeliverablePackageManifest;
}

export interface CommercialDeliverablePackageValidation {
  valid: boolean;
  coverOk: boolean;
  summaryOk: boolean;
  planOk: boolean;
  budgetOk: boolean;
  manifestOk: boolean;
  zipOk: boolean;
  apiPathRegistered: boolean;
  summary: string;
}
