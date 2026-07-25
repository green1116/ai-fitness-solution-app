/**
 * Product Billing Audit — Billing Traceability public exports
 * Isolated namespace: lib/product/billing-audit
 */

export {
  BILLING_AUDIT_CATEGORIES,
  BILLING_AUDIT_MANAGER_STATUSES,
  BILLING_AUDIT_READINESS_VERDICTS,
  BILLING_AUDIT_SEVERITIES,
  BILLING_INTEGRITY_RESULTS,
  BILLING_TRAIL_STATUSES,
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_TAG,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "./traceability/traceability.constants";

export type {
  BillingAuditManagerStatus,
  BillingAuditReadinessCheck,
  BillingAuditReadinessResult,
  BillingAuditReadinessVerdict,
  BillingAuditRegistryManifest,
} from "./traceability/traceability.types";

export type {
  BillingAuditCategory,
  BillingAuditEvent,
  BillingAuditSeverity,
  EventMetadata,
  RecordBillingAuditEventInput,
} from "./event/event.types";

export {
  clearBillingAuditEvents,
  getBillingAuditEvent,
  listBillingAuditEvents,
  recordBillingAuditEvent,
} from "./event/event.registry";

export type {
  AppendBillingTrailInput,
  BillingAuditTrail,
  BillingTrailStatus,
  MarkBillingTrailStatusInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendBillingTrail,
  clearBillingTrails,
  getBillingTrail,
  listBillingTrails,
  markBillingTrailStatus,
} from "./trail/trail.registry";

export type {
  BillingAuditSeal,
  BillingIntegrityResult,
  SealBillingTrailInput,
  SealMetadata,
  VerifyBillingSealInput,
} from "./integrity/integrity.types";

export {
  clearBillingSeals,
  getBillingSeal,
  listBillingSeals,
  sealBillingTrail,
  verifyBillingSeal,
} from "./integrity/integrity.registry";

export type {
  BillingAuditQuery,
  QueryBillingAuditInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearBillingAuditQueries,
  getBillingAuditQuery,
  listBillingAuditQueries,
  queryBillingAudit,
} from "./query/query.registry";

export {
  assertBillingAuditReadinessReady,
  evaluateBillingAuditReadiness,
} from "./traceability/traceability.readiness";

export {
  clearBillingAuditLayer,
  createBillingAuditManager,
  getBillingAuditRegistryManifest,
  type BillingAuditManager,
  type BillingAuditManagerSnapshot,
} from "./billing-audit.manager";

export {
  assertProductBillingAuditReleaseGatePass,
  checkProductBillingAuditReleaseGate,
  PRODUCT_BILLING_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
