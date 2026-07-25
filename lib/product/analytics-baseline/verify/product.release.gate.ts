/**
 * Product Analytics — Governance Freeze Release Gate
 * Isolated — does not mutate analytics modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
  isProductAnalyticsFreezeLockIntact,
  PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE,
  PRODUCT_ANALYTICS_BASELINE_ID,
  PRODUCT_ANALYTICS_FREEZE_LOCK,
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

export function checkProductAnalyticsBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_ANALYTICS_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "ANA-ID",
      "analytics-freeze",
      "Product analytics baseline ID locked",
      PRODUCT_ANALYTICS_BASELINE_ID ===
        "enterprise-product-analytics-baseline-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          PRODUCT_ANALYTICS_BASELINE_ID &&
        PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE ===
          "enterprise-product-analytics-audit-v1",
      `id=${PRODUCT_ANALYTICS_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "ANA-CHAIN",
      "analytics-freeze",
      "Analytics→Analytics Audit chain intact",
      isProductAnalyticsFreezeLockIntact(lock) &&
        lock.phases.analytics.id ===
          "enterprise-product-analytics-foundation-v1" &&
        lock.phases.analyticsAudit.id ===
          "enterprise-product-analytics-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "ANA-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ANA-READONLY",
      "analytics-freeze",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 8,
      `components=${lock.components.length}`,
    ),
  );

  checks.push(
    check(
      "ANA-UPSTREAM",
      "baselines",
      "Customer / billing / auth / upstream baselines preserved",
      lock.customerBaseline === "enterprise-product-customer-baseline-v1" &&
        lock.billingBaseline === "enterprise-product-billing-baseline-v1" &&
        lock.authBaseline === "enterprise-product-auth-baseline-v1" &&
        lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `customer=${lock.customerBaseline}`,
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
      `product-analytics-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAnalyticsBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAnalyticsBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product analytics baseline release gate failed: ${gate.summary}`,
    );
  }
}
