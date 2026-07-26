/**
 * Product Notification — Immutable freeze manifest (read-only)
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_FREEZE_LOCK,
  PRODUCT_NOTIFICATION_PHASE_VERSIONS,
} from "./freeze.lock";

export type ProductNotificationImmutableManifest = {
  baselineId: typeof PRODUCT_NOTIFICATION_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID;
  freezeVersion: typeof PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION;
  checksum: string;
  phaseIds: string[];
  readOnly: true;
};

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export const PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST: ProductNotificationImmutableManifest =
  (() => {
    const phaseIds = [
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.foundation.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.template.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.channel.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.delivery.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.preference.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.routing.id,
      PRODUCT_NOTIFICATION_PHASE_VERSIONS.notificationAudit.id,
    ];
    const payload = {
      baselineId: PRODUCT_NOTIFICATION_BASELINE_ID,
      freezeVersion: PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
      base: PRODUCT_NOTIFICATION_FREEZE_LOCK.base,
      phaseIds,
      components: PRODUCT_NOTIFICATION_FREEZE_LOCK.components.map((c) => c.id),
      readOnly: true as const,
    };
    return {
      baselineId: PRODUCT_NOTIFICATION_BASELINE_ID,
      baselineAlias: ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
      freezeVersion: PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
      checksum: checksumPayload(payload),
      phaseIds,
      readOnly: true as const,
    };
  })();

export function isProductNotificationImmutableManifestIntact(
  manifest: ProductNotificationImmutableManifest = PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
): boolean {
  return (
    manifest.readOnly === true &&
    manifest.baselineId === PRODUCT_NOTIFICATION_BASELINE_ID &&
    manifest.baselineAlias === ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID &&
    manifest.freezeVersion === PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION &&
    manifest.checksum.length === 64 &&
    manifest.phaseIds.length === 7
  );
}
