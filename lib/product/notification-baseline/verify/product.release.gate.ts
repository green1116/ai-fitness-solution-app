/**
 * Product Notification — Governance Freeze Release Gate
 * Isolated — does not mutate notification modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  isProductNotificationFreezeLockIntact,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
  PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_FREEZE_LOCK,
} from "../freeze/freeze.lock";
import {
  isProductNotificationImmutableManifestIntact,
  PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
} from "../freeze/immutable.manifest";
import {
  isProductNotificationRollbackSnapshotIntact,
  PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
} from "../freeze/rollback.snapshot";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

export function checkProductNotificationBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_NOTIFICATION_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "NTF-ID",
      "notification-freeze",
      "Product notification baseline ID locked",
      PRODUCT_NOTIFICATION_BASELINE_ID ===
        "enterprise-product-notification-baseline-v1" &&
        ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
          PRODUCT_NOTIFICATION_BASELINE_ID &&
        PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE ===
          "enterprise-product-notification-audit-v1",
      `id=${PRODUCT_NOTIFICATION_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "NTF-CHAIN",
      "notification-freeze",
      "Foundation→Audit chain intact",
      isProductNotificationFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-notification-foundation-v1" &&
        lock.phases.notificationAudit.id ===
          "enterprise-product-notification-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "NTF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "NTF-ARTIFACTS",
      "notification-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.components.length === 8 &&
        isProductNotificationImmutableManifestIntact(
          PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
        ) &&
        isProductNotificationRollbackSnapshotIntact(
          PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "NTF-UPSTREAM",
      "baselines",
      "Admin / analytics / customer / billing / auth / upstream baselines preserved",
      lock.adminBaseline === "enterprise-product-admin-baseline-v1" &&
        lock.analyticsBaseline ===
          "enterprise-product-analytics-baseline-v1" &&
        lock.customerBaseline === "enterprise-product-customer-baseline-v1" &&
        lock.billingBaseline === "enterprise-product-billing-baseline-v1" &&
        lock.authBaseline === "enterprise-product-auth-baseline-v1" &&
        lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `admin=${lock.adminBaseline}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-notification-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductNotificationBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductNotificationBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product notification baseline release gate failed: ${gate.summary}`,
    );
  }
}
