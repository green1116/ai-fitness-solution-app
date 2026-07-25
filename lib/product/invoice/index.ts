/**
 * Product Invoice — Invoice Engine public exports
 * Isolated namespace: lib/product/invoice
 */

export {
  DOCUMENT_STATUSES,
  INVOICE_MANAGER_STATUSES,
  INVOICE_READINESS_VERDICTS,
  LINE_KINDS,
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
  PRODUCT_INVOICE_FREEZE_VERSION,
  SETTLEMENT_RESULTS,
  TAX_MODES,
} from "./engine/engine.constants";

export type {
  InvoiceManagerStatus,
  InvoiceReadinessCheck,
  InvoiceReadinessResult,
  InvoiceReadinessVerdict,
  InvoiceRegistryManifest,
} from "./engine/engine.types";

export type {
  CreateDocumentInput,
  DocumentMetadata,
  DocumentStatus,
  InvoiceDocument,
  IssueDocumentInput,
  VoidDocumentInput,
} from "./document/document.types";

export {
  clearDocuments,
  createDocument,
  getDocument,
  issueDocument,
  listDocuments,
  voidDocument,
} from "./document/document.registry";

export type {
  AddLineInput,
  InvoiceLine,
  LineKind,
  LineMetadata,
} from "./line/line.types";

export {
  addLine,
  clearLines,
  getLine,
  listLines,
} from "./line/line.registry";

export type {
  ApplyTaxInput,
  InvoiceTax,
  TaxMetadata,
  TaxMode,
} from "./tax/tax.types";

export {
  applyTax,
  clearTaxes,
  getTax,
  listTaxes,
} from "./tax/tax.registry";

export type {
  InvoiceSettlement,
  SettleDocumentInput,
  SettlementMetadata,
  SettlementResult,
} from "./settlement/settlement.types";

export {
  clearSettlements,
  getSettlement,
  listSettlements,
  settleDocument,
} from "./settlement/settlement.registry";

export {
  assertInvoiceEngineReadinessReady,
  evaluateInvoiceEngineReadiness,
} from "./engine/engine.readiness";

export {
  clearInvoiceEngineLayer,
  createInvoiceManager,
  getInvoiceRegistryManifest,
  type InvoiceManager,
  type InvoiceManagerSnapshot,
} from "./invoice.manager";

export {
  assertProductInvoiceReleaseGatePass,
  checkProductInvoiceReleaseGate,
  PRODUCT_INVOICE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
