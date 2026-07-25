/**
 * Product Admin — Governance Freeze Release Gate
 * Isolated — does not mutate admin modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
  isProductAdminFreezeLockIntact,
  PRODUCT_ADMIN_BASELINE_FREEZE_BASE,
  PRODUCT_ADMIN_BASELINE_ID,
  PRODUCT_ADMIN_FREEZE_LOCK,
} from "../freeze/freeze.lock";

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

export function checkProductAdminBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_ADMIN_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "ADM-ID",
      "admin-freeze",
      "Product admin baseline ID locked",
      PRODUCT_ADMIN_BASELINE_ID ===
        "enterprise-product-admin-baseline-v1" &&
        ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID === PRODUCT_ADMIN_BASELINE_ID &&
        PRODUCT_ADMIN_BASELINE_FREEZE_BASE ===
          "enterprise-product-admin-audit-v1",
      `id=${PRODUCT_ADMIN_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "ADM-CHAIN",
      "admin-freeze",
      "Admin→Admin Audit chain intact",
      isProductAdminFreezeLockIntact(lock) &&
        lock.phases.admin.id ===
          "enterprise-product-admin-foundation-v1" &&
        lock.phases.adminAudit.id === "enterprise-product-admin-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "ADM-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ADM-READONLY",
      "admin-freeze",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 8,
      `components=${lock.components.length}`,
    ),
  );

  checks.push(
    check(
      "ADM-UPSTREAM",
      "baselines",
      "Analytics / customer / billing / auth / upstream baselines preserved",
      lock.analyticsBaseline ===
        "enterprise-product-analytics-baseline-v1" &&
        lock.customerBaseline === "enterprise-product-customer-baseline-v1" &&
        lock.billingBaseline === "enterprise-product-billing-baseline-v1" &&
        lock.authBaseline === "enterprise-product-auth-baseline-v1" &&
        lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `analytics=${lock.analyticsBaseline}`,
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
      `product-admin-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAdminBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAdminBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product admin baseline release gate failed: ${gate.summary}`,
    );
  }
}
