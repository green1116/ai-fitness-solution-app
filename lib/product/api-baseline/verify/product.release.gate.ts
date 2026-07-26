/**
 * Product API — Governance Freeze Release Gate
 * Isolated — does not mutate API modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_API_BASELINE_ID,
  isProductApiFreezeLockIntact,
  PRODUCT_API_BASELINE_FREEZE_BASE,
  PRODUCT_API_BASELINE_ID,
  PRODUCT_API_FREEZE_LOCK,
} from "../freeze/freeze.lock";
import {
  isProductApiImmutableManifestIntact,
  PRODUCT_API_IMMUTABLE_MANIFEST,
} from "../freeze/immutable.manifest";
import {
  isProductApiRollbackSnapshotIntact,
  PRODUCT_API_ROLLBACK_SNAPSHOT,
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

export function checkProductApiBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_API_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "API-ID",
      "api-freeze",
      "Product API baseline ID locked",
      PRODUCT_API_BASELINE_ID === "enterprise-product-api-baseline-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID === PRODUCT_API_BASELINE_ID &&
        PRODUCT_API_BASELINE_FREEZE_BASE ===
          "enterprise-product-api-audit-v1",
      `id=${PRODUCT_API_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "API-CHAIN",
      "api-freeze",
      "Foundation→Audit chain intact",
      isProductApiFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-api-foundation-v1" &&
        lock.phases.apiAudit.id === "enterprise-product-api-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "API-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "API-ARTIFACTS",
      "api-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.components.length === 8 &&
        isProductApiImmutableManifestIntact(PRODUCT_API_IMMUTABLE_MANIFEST) &&
        isProductApiRollbackSnapshotIntact(PRODUCT_API_ROLLBACK_SNAPSHOT),
      `checksum=${PRODUCT_API_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "API-UPSTREAM",
      "baselines",
      "Notification / admin / analytics / customer / billing / auth / upstream baselines preserved",
      lock.notificationBaseline ===
        "enterprise-product-notification-baseline-v1" &&
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
      `notification=${lock.notificationBaseline}`,
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
      `product-api-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API baseline release gate failed: ${gate.summary}`,
    );
  }
}
