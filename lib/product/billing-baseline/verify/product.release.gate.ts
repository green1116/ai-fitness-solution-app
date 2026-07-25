/**
 * Product Billing — Governance Freeze Release Gate
 * Isolated — does not mutate billing modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  isProductBillingFreezeLockIntact,
  PRODUCT_BILLING_BASELINE_FREEZE_BASE,
  PRODUCT_BILLING_BASELINE_ID,
  PRODUCT_BILLING_FREEZE_LOCK,
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

export function checkProductBillingBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_BILLING_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "BIL-ID",
      "billing-freeze",
      "Product billing baseline ID locked",
      PRODUCT_BILLING_BASELINE_ID ===
        "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          PRODUCT_BILLING_BASELINE_ID &&
        PRODUCT_BILLING_BASELINE_FREEZE_BASE ===
          "enterprise-product-billing-audit-v1",
      `id=${PRODUCT_BILLING_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "BIL-CHAIN",
      "billing-freeze",
      "Billing→Audit billing chain intact",
      isProductBillingFreezeLockIntact(lock) &&
        lock.phases.billing.id ===
          "enterprise-product-billing-foundation-v1" &&
        lock.phases.billingAudit.id ===
          "enterprise-product-billing-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "BIL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "BIL-READONLY",
      "billing-freeze",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 8,
      `components=${lock.components.length}`,
    ),
  );

  checks.push(
    check(
      "BIL-UPSTREAM",
      "baselines",
      "Auth / product complete / upstream baselines preserved",
      lock.authBaseline === "enterprise-product-auth-baseline-v1" &&
        lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `auth=${lock.authBaseline}`,
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
      `product-billing-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductBillingBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductBillingBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product billing baseline release gate failed: ${gate.summary}`,
    );
  }
}
