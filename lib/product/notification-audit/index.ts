/**
 * Product Notification Audit — public exports
 * Isolated namespace: lib/product/notification-audit
 */

export {
  NOTIFICATION_AUDIT_CATEGORIES,
  NOTIFICATION_AUDIT_INTEGRITY_VERDICTS,
  NOTIFICATION_AUDIT_MANAGER_STATUSES,
  NOTIFICATION_AUDIT_READINESS_VERDICTS,
  NOTIFICATION_AUDIT_SEVERITIES,
  NOTIFICATION_AUDIT_TRAIL_STATUSES,
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "./management/management.constants";

export type {
  NotificationAuditManagerStatus,
  NotificationAuditReadinessCheck,
  NotificationAuditReadinessResult,
  NotificationAuditReadinessVerdict,
  NotificationAuditRegistryManifest,
} from "./management/management.types";

export type {
  EventMetadata,
  NotificationAuditCategory,
  NotificationAuditEvent,
  NotificationAuditSeverity,
  RecordNotificationAuditEventInput,
} from "./event/event.types";

export {
  clearNotificationAuditEvents,
  getNotificationAuditEvent,
  listNotificationAuditEvents,
  recordNotificationAuditEvent,
} from "./event/event.registry";

export type {
  AppendNotificationAuditTrailInput,
  NotificationAuditTrail,
  NotificationAuditTrailStatus,
  SealNotificationAuditTrailInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendNotificationAuditTrail,
  clearNotificationAuditTrails,
  getNotificationAuditTrail,
  listNotificationAuditTrails,
  sealNotificationAuditTrail,
} from "./trail/trail.registry";

export type {
  IntegrityMetadata,
  NotificationAuditIntegrity,
  NotificationAuditIntegrityVerdict,
  SealNotificationAuditIntegrityInput,
} from "./integrity/integrity.types";

export {
  clearNotificationAuditIntegrities,
  getNotificationAuditIntegrity,
  listNotificationAuditIntegrities,
  sealNotificationAuditIntegrity,
} from "./integrity/integrity.registry";

export type {
  NotificationAuditQuery,
  QueryMetadata,
  RunNotificationAuditQueryInput,
} from "./query/query.types";

export {
  clearNotificationAuditQueries,
  getNotificationAuditQuery,
  listNotificationAuditQueries,
  runNotificationAuditQuery,
} from "./query/query.registry";

export type { NotificationAuditReleaseManifest } from "./manifest/manifest.registry";

export {
  clearNotificationAuditReleaseManifests,
  createNotificationAuditReleaseManifest,
  getNotificationAuditReleaseManifest,
  listNotificationAuditReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertNotificationAuditReadinessReady,
  evaluateNotificationAuditReadiness,
} from "./management/management.readiness";

export {
  clearNotificationAuditLayer,
  createNotificationAuditManager,
  getNotificationAuditRegistryManifest,
  type NotificationAuditManager,
  type NotificationAuditManagerSnapshot,
} from "./notification-audit.manager";

export {
  assertProductNotificationAuditReleaseGatePass,
  checkProductNotificationAuditReleaseGate,
  PRODUCT_NOTIFICATION_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
