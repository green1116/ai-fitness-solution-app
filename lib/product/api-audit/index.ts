/**
 * Product API Audit — public exports
 * Isolated namespace: lib/product/api-audit
 */

export {
  API_AUDIT_CATEGORIES,
  API_AUDIT_INTEGRITY_VERDICTS,
  API_AUDIT_MANAGER_STATUSES,
  API_AUDIT_READINESS_VERDICTS,
  API_AUDIT_SEVERITIES,
  API_AUDIT_TRAIL_STATUSES,
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_TAG,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "./management/management.constants";

export type {
  ApiAuditManagerStatus,
  ApiAuditReadinessCheck,
  ApiAuditReadinessResult,
  ApiAuditReadinessVerdict,
  ApiAuditRegistryManifest,
} from "./management/management.types";

export type {
  ApiAuditCategory,
  ApiAuditEvent,
  ApiAuditSeverity,
  EventMetadata,
  RecordApiAuditEventInput,
} from "./event/event.types";

export {
  clearApiAuditEvents,
  getApiAuditEvent,
  listApiAuditEvents,
  recordApiAuditEvent,
} from "./event/event.registry";

export type {
  AppendApiAuditTrailInput,
  ApiAuditTrail,
  ApiAuditTrailStatus,
  SealApiAuditTrailInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendApiAuditTrail,
  clearApiAuditTrails,
  getApiAuditTrail,
  listApiAuditTrails,
  sealApiAuditTrail,
} from "./trail/trail.registry";

export type {
  ApiAuditQuery,
  QueryMetadata,
  RunApiAuditQueryInput,
} from "./query/query.types";

export {
  clearApiAuditQueries,
  getApiAuditQuery,
  listApiAuditQueries,
  runApiAuditQuery,
} from "./query/query.registry";

export type {
  ApiAuditIntegrity,
  ApiAuditIntegrityVerdict,
  IntegrityMetadata,
  SealApiAuditIntegrityInput,
} from "./integrity/integrity.types";

export {
  clearApiAuditIntegrities,
  getApiAuditIntegrity,
  listApiAuditIntegrities,
  sealApiAuditIntegrity,
} from "./integrity/integrity.registry";

export type { ApiAuditReleaseManifest } from "./manifest/manifest.registry";

export {
  clearApiAuditReleaseManifests,
  createApiAuditReleaseManifest,
  getApiAuditReleaseManifest,
  listApiAuditReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertApiAuditReadinessReady,
  evaluateApiAuditReadiness,
} from "./management/management.readiness";

export {
  clearApiAuditLayer,
  createApiAuditManager,
  getApiAuditRegistryManifest,
  type ApiAuditManager,
  type ApiAuditManagerSnapshot,
} from "./api-audit.manager";

export {
  assertProductApiAuditReleaseGatePass,
  checkProductApiAuditReleaseGate,
  PRODUCT_API_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
