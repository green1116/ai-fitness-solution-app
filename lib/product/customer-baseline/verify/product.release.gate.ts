/**
 * Product Customer — Governance Freeze Release Gate
 * Isolated — does not mutate customer modules
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
  isProductCustomerFreezeLockIntact,
  PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE,
  PRODUCT_CUSTOMER_BASELINE_ID,
  PRODUCT_CUSTOMER_FREEZE_LOCK,
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

export function checkProductCustomerBaselineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const lock = PRODUCT_CUSTOMER_FREEZE_LOCK;
  const platform = buildPlatformV1Manifest();

  checks.push(
    check(
      "CUS-ID",
      "customer-freeze",
      "Product customer baseline ID locked",
      PRODUCT_CUSTOMER_BASELINE_ID ===
        "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          PRODUCT_CUSTOMER_BASELINE_ID &&
        PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE ===
          "enterprise-product-crm-audit-v1",
      `id=${PRODUCT_CUSTOMER_BASELINE_ID}`,
    ),
  );

  checks.push(
    check(
      "CUS-CHAIN",
      "customer-freeze",
      "Customer→CRM Audit chain intact",
      isProductCustomerFreezeLockIntact(lock) &&
        lock.phases.customer.id ===
          "enterprise-product-customer-foundation-v1" &&
        lock.phases.crmAudit.id === "enterprise-product-crm-audit-v1",
      `phases=${Object.keys(lock.phases).length}`,
    ),
  );

  checks.push(
    check(
      "CUS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CUS-READONLY",
      "customer-freeze",
      "Freeze lock is read-only",
      lock.readOnly === true && lock.components.length === 8,
      `components=${lock.components.length}`,
    ),
  );

  checks.push(
    check(
      "CUS-UPSTREAM",
      "baselines",
      "Billing / auth / upstream baselines preserved",
      lock.billingBaseline === "enterprise-product-billing-baseline-v1" &&
        lock.authBaseline === "enterprise-product-auth-baseline-v1" &&
        lock.productCompleteBaseline === "enterprise-product-complete-v1" &&
        lock.operationsBaseline === "enterprise-operations-complete-v1" &&
        lock.launchBaseline === "enterprise-launch-complete-v1" &&
        lock.e12Baseline === "enterprise-e12-productization-complete-v1",
      `billing=${lock.billingBaseline}`,
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
      `product-customer-baseline-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCustomerBaselineReleaseGatePass(
  gate: ReleaseGateResult = checkProductCustomerBaselineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product customer baseline release gate failed: ${gate.summary}`,
    );
  }
}
