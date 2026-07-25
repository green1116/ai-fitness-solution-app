/**
 * Product Audit — Security Traceability public exports
 * Isolated namespace: lib/product/audit
 */

export {
  AUDIT_EVENT_CATEGORIES,
  AUDIT_INTEGRITY_RESULTS,
  AUDIT_MANAGER_STATUSES,
  AUDIT_READINESS_VERDICTS,
  AUDIT_SEVERITIES,
  AUDIT_TRAIL_STATUSES,
  PRODUCT_AUDIT_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "./security/security.constants";

export type {
  AuditManagerStatus,
  AuditReadinessCheck,
  AuditReadinessResult,
  AuditReadinessVerdict,
  AuditRegistryManifest,
} from "./security/security.types";

export type {
  AuditEvent,
  AuditEventCategory,
  AuditSeverity,
  EventMetadata,
  RecordAuditEventInput,
} from "./event/event.types";

export {
  clearAuditEvents,
  getAuditEvent,
  listAuditEvents,
  recordAuditEvent,
} from "./event/event.registry";

export type {
  AppendTrailInput,
  AuditTrailEntry,
  AuditTrailStatus,
  MarkTrailStatusInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendTrail,
  clearTrails,
  getTrail,
  listTrails,
  markTrailStatus,
} from "./trail/trail.registry";

export type {
  AuditIntegrityResult,
  AuditSeal,
  SealMetadata,
  SealTrailInput,
  VerifySealInput,
} from "./integrity/integrity.types";

export {
  clearSeals,
  getSeal,
  listSeals,
  sealTrail,
  verifySeal,
} from "./integrity/integrity.registry";

export type {
  AuditQuery,
  QueryAuditTrailInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearAuditQueries,
  getAuditQuery,
  listAuditQueries,
  queryAuditTrail,
} from "./query/query.registry";

export {
  assertAuditTraceabilityReadinessReady,
  evaluateAuditTraceabilityReadiness,
} from "./security/security.readiness";

export {
  clearAuditTraceabilityLayer,
  createAuditManager,
  getAuditRegistryManifest,
  type AuditManager,
  type AuditManagerSnapshot,
} from "./audit.manager";

export {
  assertProductAuditReleaseGatePass,
  checkProductAuditReleaseGate,
  PRODUCT_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
