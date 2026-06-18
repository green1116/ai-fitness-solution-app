import type { ProductSku } from "@/lib/commercial-products/shared/constants";
import type { IntelligenceSnapshot } from "@/lib/commercial-products/shared/types";
import type { QuoteSnapshot } from "../shared/types";

export interface SummaryPdfRequest {
  quoteId: string;
  snapshot?: QuoteSnapshot;
}

export interface SummaryPdfSection {
  sectionId: string;
  title: string;
  body: string;
}

export interface SummaryPdfMeta {
  filename: string;
  mimeType: "application/pdf";
  pageCount: number;
  byteLength: number;
}

export interface SummaryPdfContext {
  quoteId: string;
  sku: ProductSku;
  projectName: string;
  productName: string;
  suggestedPriceCny: number;
  priceBand: { min: number; max: number };
  sla: string;
  eligible: boolean;
  eligibilityReasons: string[];
  createdAt: string;
  sections: SummaryPdfSection[];
  intelligence: IntelligenceSnapshot;
  pdfMeta: SummaryPdfMeta;
}

export interface SummaryPdfResult {
  quoteId: string;
  sku: ProductSku;
  projectName: string;
  createdAt: string;
  buffer: Uint8Array;
  pdfMeta: SummaryPdfMeta;
  context: SummaryPdfContext;
}

export interface CommercialSummaryPdfValidation {
  valid: boolean;
  snapshotLoaded: boolean;
  catalogLoaded: boolean;
  sectionCountOk: boolean;
  bufferGenerated: boolean;
  mimeTypeOk: boolean;
  noPlanIdDependency: boolean;
  noBudgetIdDependency: boolean;
  summary: string;
}
