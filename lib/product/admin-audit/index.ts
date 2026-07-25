/**
 * Product Admin Audit — public exports
 * Isolated namespace: lib/product/admin-audit
 */

export {
  ADMIN_AUDIT_CATEGORIES,
  ADMIN_AUDIT_MANAGER_STATUSES,
  ADMIN_AUDIT_READINESS_VERDICTS,
  ADMIN_AUDIT_SEVERITIES,
  ADMIN_INTEGRITY_RESULTS,
  ADMIN_TRAIL_STATUSES,
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_TAG,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
} from "./traceability/traceability.constants";

export type {
  AdminAuditManagerStatus,
  AdminAuditReadinessCheck,
  AdminAuditReadinessResult,
  AdminAuditReadinessVerdict,
  AdminAuditRegistryManifest,
} from "./traceability/traceability.types";

export type {
  AdminAuditCategory,
  AdminAuditEvent,
  AdminAuditSeverity,
  EventMetadata,
  RecordAdminAuditEventInput,
} from "./event/event.types";

export {
  clearAdminAuditEvents,
  getAdminAuditEvent,
  listAdminAuditEvents,
  recordAdminAuditEvent,
} from "./event/event.registry";

export type {
  AdminAuditTrail,
  AdminTrailStatus,
  AppendAdminTrailInput,
  MarkAdminTrailStatusInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendAdminTrail,
  clearAdminTrails,
  getAdminTrail,
  listAdminTrails,
  markAdminTrailStatus,
} from "./trail/trail.registry";

export type {
  AdminAuditSeal,
  AdminIntegrityResult,
  SealAdminTrailInput,
  SealMetadata,
  VerifyAdminSealInput,
} from "./integrity/integrity.types";

export {
  clearAdminSeals,
  getAdminSeal,
  listAdminSeals,
  sealAdminTrail,
  verifyAdminSeal,
} from "./integrity/integrity.registry";

export type {
  AdminAuditQuery,
  QueryAdminAuditInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearAdminAuditQueries,
  getAdminAuditQuery,
  listAdminAuditQueries,
  queryAdminAudit,
} from "./query/query.registry";

export {
  assertAdminAuditReadinessReady,
  evaluateAdminAuditReadiness,
} from "./traceability/traceability.readiness";

export {
  clearAdminAuditLayer,
  createAdminAuditManager,
  getAdminAuditRegistryManifest,
  type AdminAuditManager,
  type AdminAuditManagerSnapshot,
} from "./admin-audit.manager";

export {
  assertProductAdminAuditReleaseGatePass,
  checkProductAdminAuditReleaseGate,
  PRODUCT_ADMIN_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
