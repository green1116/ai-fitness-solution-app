/**
 * Product Marketplace — Governance Freeze Release Gate
 * Isolated — does not mutate marketplace modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  isProductMarketplaceFreezeLockIntact,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
  PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_FREEZE_LOCK,
} from "../freeze/freeze.lock";
import {
  isProductMarketplaceImmutableManifestIntact,
  PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
} from "../freeze/immutable.manifest";
import {
  isProductMarketplaceRollbackSnapshotIntact,
  PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
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

export function checkProductMarketplaceBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_MARKETPLACE_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "MP-ID",
      "marketplace-freeze",
      "Product marketplace baseline ID locked",
      PRODUCT_MARKETPLACE_BASELINE_ID ===
        "enterprise-product-marketplace-baseline-v1" &&
        ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID ===
          PRODUCT_MARKETPLACE_BASELINE_ID &&
        PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE ===
          "enterprise-product-marketplace-audit-v1",
      `id=${PRODUCT_MARKETPLACE_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "MP-CHAIN",
      "marketplace-freeze",
      "Foundation→Audit chain intact",
      isProductMarketplaceFreezeLockIntact(lock) &&
        lock.phases.foundation.id ===
          "enterprise-product-marketplace-foundation-v1" &&
        lock.phases.marketplaceAudit.id ===
          "enterprise-product-marketplace-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "MP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MP-ARTIFACTS",
      "marketplace-freeze",
      "Read-only freeze + immutable manifest + rollback snapshot",
      lock.readOnly === true &&
        lock.components.length === 8 &&
        isProductMarketplaceImmutableManifestIntact(
          PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
        ) &&
        isProductMarketplaceRollbackSnapshotIntact(
          PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
        ),
      `checksum=${PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST.checksum.slice(0, 12)}…`,
    ),
  );

  checks.push(
    check(
      "MP-UPSTREAM",
      "baselines",
      "API / notification / admin / analytics / customer / billing / auth / upstream baselines preserved",
      lock.apiBaseline === "enterprise-product-api-baseline-v1" &&
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
      `api=${lock.apiBaseline}`,
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
      `product-marketplace-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMarketplaceBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductMarketplaceBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product marketplace baseline release gate failed: ${gate.summary}`,
    );
  }
}
