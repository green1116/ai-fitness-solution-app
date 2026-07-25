/**
 * Product CRM Audit — public exports
 * Isolated namespace: lib/product/crm-audit
 */

export {
  CRM_AUDIT_CATEGORIES,
  CRM_AUDIT_MANAGER_STATUSES,
  CRM_AUDIT_READINESS_VERDICTS,
  CRM_AUDIT_SEVERITIES,
  CRM_INTEGRITY_RESULTS,
  CRM_TRAIL_STATUSES,
  PRODUCT_CRM_AUDIT_BASE,
  PRODUCT_CRM_AUDIT_FREEZE_TAG,
  PRODUCT_CRM_AUDIT_FREEZE_VERSION,
  PRODUCT_CRM_AUDIT_ID,
  PRODUCT_CRM_AUDIT_VERSION,
} from "./traceability/traceability.constants";

export type {
  CrmAuditManagerStatus,
  CrmAuditReadinessCheck,
  CrmAuditReadinessResult,
  CrmAuditReadinessVerdict,
  CrmAuditRegistryManifest,
} from "./traceability/traceability.types";

export type {
  CrmAuditCategory,
  CrmAuditEvent,
  CrmAuditSeverity,
  EventMetadata,
  RecordCrmAuditEventInput,
} from "./event/event.types";

export {
  clearCrmAuditEvents,
  getCrmAuditEvent,
  listCrmAuditEvents,
  recordCrmAuditEvent,
} from "./event/event.registry";

export type {
  AppendCrmTrailInput,
  CrmAuditTrail,
  CrmTrailStatus,
  MarkCrmTrailStatusInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendCrmTrail,
  clearCrmTrails,
  getCrmTrail,
  listCrmTrails,
  markCrmTrailStatus,
} from "./trail/trail.registry";

export type {
  CrmAuditSeal,
  CrmIntegrityResult,
  SealCrmTrailInput,
  SealMetadata,
  VerifyCrmSealInput,
} from "./integrity/integrity.types";

export {
  clearCrmSeals,
  getCrmSeal,
  listCrmSeals,
  sealCrmTrail,
  verifyCrmSeal,
} from "./integrity/integrity.registry";

export type {
  CrmAuditQuery,
  QueryCrmAuditInput,
  QueryMetadata,
} from "./query/query.types";

export {
  clearCrmAuditQueries,
  getCrmAuditQuery,
  listCrmAuditQueries,
  queryCrmAudit,
} from "./query/query.registry";

export {
  assertCrmAuditReadinessReady,
  evaluateCrmAuditReadiness,
} from "./traceability/traceability.readiness";

export {
  clearCrmAuditLayer,
  createCrmAuditManager,
  getCrmAuditRegistryManifest,
  type CrmAuditManager,
  type CrmAuditManagerSnapshot,
} from "./crm-audit.manager";

export {
  assertProductCrmAuditReleaseGatePass,
  checkProductCrmAuditReleaseGate,
  PRODUCT_CRM_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
