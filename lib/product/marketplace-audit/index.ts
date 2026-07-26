/**
 * Product Marketplace Audit — public exports
 * Isolated namespace: lib/product/marketplace-audit
 */

export {
  MARKETPLACE_AUDIT_CATEGORIES,
  MARKETPLACE_AUDIT_INTEGRITY_VERDICTS,
  MARKETPLACE_AUDIT_MANAGER_STATUSES,
  MARKETPLACE_AUDIT_READINESS_VERDICTS,
  MARKETPLACE_AUDIT_SEVERITIES,
  MARKETPLACE_AUDIT_TRAIL_STATUSES,
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "./management/management.constants";

export type {
  MarketplaceAuditManagerStatus,
  MarketplaceAuditReadinessCheck,
  MarketplaceAuditReadinessResult,
  MarketplaceAuditReadinessVerdict,
  MarketplaceAuditRegistryManifest,
} from "./management/management.types";

export type {
  EventMetadata,
  MarketplaceAuditCategory,
  MarketplaceAuditEvent,
  MarketplaceAuditSeverity,
  RecordMarketplaceAuditEventInput,
} from "./event/event.types";

export {
  clearMarketplaceAuditEvents,
  getMarketplaceAuditEvent,
  listMarketplaceAuditEvents,
  recordMarketplaceAuditEvent,
} from "./event/event.registry";

export type {
  AppendMarketplaceAuditTrailInput,
  MarketplaceAuditTrail,
  MarketplaceAuditTrailStatus,
  SealMarketplaceAuditTrailInput,
  TrailMetadata,
} from "./trail/trail.types";

export {
  appendMarketplaceAuditTrail,
  clearMarketplaceAuditTrails,
  getMarketplaceAuditTrail,
  listMarketplaceAuditTrails,
  sealMarketplaceAuditTrail,
} from "./trail/trail.registry";

export type {
  MarketplaceAuditQuery,
  QueryMetadata,
  RunMarketplaceAuditQueryInput,
} from "./query/query.types";

export {
  clearMarketplaceAuditQueries,
  getMarketplaceAuditQuery,
  listMarketplaceAuditQueries,
  runMarketplaceAuditQuery,
} from "./query/query.registry";

export type {
  IntegrityMetadata,
  MarketplaceAuditIntegrity,
  MarketplaceAuditIntegrityVerdict,
  SealMarketplaceAuditIntegrityInput,
} from "./integrity/integrity.types";

export {
  clearMarketplaceAuditIntegrities,
  getMarketplaceAuditIntegrity,
  listMarketplaceAuditIntegrities,
  sealMarketplaceAuditIntegrity,
} from "./integrity/integrity.registry";

export type { MarketplaceAuditReleaseManifest } from "./manifest/manifest.registry";

export {
  clearMarketplaceAuditReleaseManifests,
  createMarketplaceAuditReleaseManifest,
  getMarketplaceAuditReleaseManifest,
  listMarketplaceAuditReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertMarketplaceAuditReadinessReady,
  evaluateMarketplaceAuditReadiness,
} from "./management/management.readiness";

export {
  clearMarketplaceAuditLayer,
  createMarketplaceAuditManager,
  getMarketplaceAuditRegistryManifest,
  type MarketplaceAuditManager,
  type MarketplaceAuditManagerSnapshot,
} from "./marketplace-audit.manager";

export {
  assertProductMarketplaceAuditReleaseGatePass,
  checkProductMarketplaceAuditReleaseGate,
  PRODUCT_MARKETPLACE_AUDIT_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
