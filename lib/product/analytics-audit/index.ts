/**
 * Product Analytics Audit — public exports
 * Isolated namespace: lib/product/analytics-audit
 */

export {
  ANALYTICS_AUDIT_CATEGORIES,
  ANALYTICS_AUDIT_MANAGER_STATUSES,
  ANALYTICS_AUDIT_READINESS_VERDICTS,
  ANALYTICS_AUDIT_SEVERITIES,
  ANALYTICS_INTEGRITY_RESULTS,
  ANALYTICS_TRAIL_STATUSES,
  PRODUCT_ANALYTICS_AUDIT_BASE,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_TAG,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
  PRODUCT_ANALYTICS_AUDIT_ID,
  PRODUCT_ANALYTICS_AUDIT_VERSION,
} from "./traceability/traceability.constants";

export type {
  AnalyticsAuditManagerStatus,
  AnalyticsAuditReadinessCheck,
  AnalyticsAuditReadinessResult,
  AnalyticsAuditReadinessVerdict,
  AnalyticsAuditRegistryManifest,
} from "./traceability/traceability.types";

export type {
  AnalyticsAuditCategory,
  AnalyticsAuditEvent,
  AnalyticsAuditSeverity,
  EventMetadata,
  RecordAnalyticsAuditEventInput,
} from "./event/event.types";

export {
  clearAnalyticsAuditEvents,
  getAnalyticsAuditEvent,
  listAnalyticsAuditEvents,
  recordAnalyticsAuditEvent,
} from "./event/event.registry";

export type {
  AnalyticsAuditTrail,
  AnalyticsTrailStatus,
  AppendAnalyticsTrailInput,
  MarkAnalyticsTrailStatusInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendAnalyticsTrail,
  clearAnalyticsTrails,
  getAnalyticsTrail,
  listAnalyticsTrails,
  markAnalyticsTrailStatus,
} from "./trail/trail.registry";

export type {
  AnalyticsAuditSeal,
  AnalyticsIntegrityResult,
  SealAnalyticsTrailInput,
  SealMetadata,
  VerifyAnalyticsSealInput,
} from "./integrity/integrity.types";

export {
  clearAnalyticsSeals,
  getAnalyticsSeal,
  listAnalyticsSeals,
  sealAnalyticsTrail,
  verifyAnalyticsSeal,
} from "./integrity/integrity.registry";

export type {
  AnalyticsAuditQuery,
  QueryAnalyticsAuditInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearAnalyticsAuditQueries,
  getAnalyticsAuditQuery,
  listAnalyticsAuditQueries,
  queryAnalyticsAudit,
} from "./query/query.registry";

export {
  assertAnalyticsAuditReadinessReady,
  evaluateAnalyticsAuditReadiness,
} from "./traceability/traceability.readiness";

export {
  clearAnalyticsAuditLayer,
  createAnalyticsAuditManager,
  getAnalyticsAuditRegistryManifest,
  type AnalyticsAuditManager,
  type AnalyticsAuditManagerSnapshot,
} from "./analytics-audit.manager";

export {
  assertProductAnalyticsAuditReleaseGatePass,
  checkProductAnalyticsAuditReleaseGate,
  PRODUCT_ANALYTICS_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
