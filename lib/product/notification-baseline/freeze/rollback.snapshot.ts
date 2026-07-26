/**
 * Product Notification — Rollback snapshot (read-only restore point)
 */

import {
  ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_COMPONENT_LOCK,
  PRODUCT_NOTIFICATION_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductNotificationRollbackSnapshot = {
  snapshotId: "product-notification-baseline-rollback-1";
  baselineId: typeof PRODUCT_NOTIFICATION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID;
  freezeVersion: typeof PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION;
  restoreBase: typeof PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE;
  restorePhaseIds: string[];
  restoreComponentPaths: string[];
  readOnly: true;
};

export const PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT: ProductNotificationRollbackSnapshot =
  {
    snapshotId: "product-notification-baseline-rollback-1",
    baselineId: PRODUCT_NOTIFICATION_BASELINE_ID,
    baselineAlias: ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
    freezeVersion: PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
    restoreBase: PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
    restorePhaseIds: [
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.foundation.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.template.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.channel.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.delivery.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.preference.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.routing.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.notificationAudit.id,
    ],
    restoreComponentPaths: PRODUCT_NOTIFICATION_COMPONENT_LOCK.map(
      (c) => c.path,
    ),
    readOnly: true,
  };

export function isProductNotificationRollbackSnapshotIntact(
  snapshot: ProductNotificationRollbackSnapshot = PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
): boolean {
  return (
    snapshot.readOnly === true &&
    snapshot.snapshotId === "product-notification-baseline-rollback-1" &&
    snapshot.baselineId === PRODUCT_NOTIFICATION_BASELINE_ID &&
    snapshot.restoreBase === PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE &&
    snapshot.restorePhaseIds.length === 7 &&
    snapshot.restoreComponentPaths.length === 8
  );
}
