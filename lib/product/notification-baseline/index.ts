/**
 * Product Notification — Governance Freeze public exports
 * Isolated namespace: lib/product/notification-baseline
 */

export {
  ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  isProductNotificationFreezeLockIntact,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_COMPONENT_LOCK,
  PRODUCT_NOTIFICATION_FREEZE_LOCK,
  PRODUCT_NOTIFICATION_PHASE_VERSIONS,
  PRODUCT_NOTIFICATION_SIGNOFF_VERSION,
  type ProductNotificationComponentId,
  type ProductNotificationComponentLock,
  type ProductNotificationFreezeLock,
  type ProductNotificationPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductNotificationImmutableManifestIntact,
  PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
  type ProductNotificationImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductNotificationRollbackSnapshotIntact,
  PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
  type ProductNotificationRollbackSnapshot,
} from "./freeze/rollback.snapshot";

export {
  assertProductNotificationBaselineReleaseGatePass,
  checkProductNotificationBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
