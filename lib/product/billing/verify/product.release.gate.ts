/**
 * Product Billing — Billing Foundation Release Gate
 * MODULE: Billing
 * BASE: enterprise-product-auth-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { PRODUCT_AUDIT_TRACEABILITY_ID } from "../../audit/security/security.constants";
import {
  assertBillingFoundationReadinessReady,
  clearBillingFoundationLayer,
  createBillingManager,
  getBillingRegistryManifest,
} from "../billing.manager";
import {
  BILLING_ACCOUNT_STATUSES,
  BILLING_MANAGER_STATUSES,
  BILLING_PLAN_TIERS,
  BILLING_READINESS_VERDICTS,
  INVOICE_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_BILLING_FOUNDATION_BASE,
  PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
  PRODUCT_BILLING_FOUNDATION_ID,
  PRODUCT_BILLING_FOUNDATION_VERSION,
  PRODUCT_BILLING_FREEZE_VERSION,
} from "../foundation/foundation.constants";

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

export const PRODUCT_BILLING_SIGNOFF_VERSION =
  "product-billing-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearBillingFoundationLayer();
}

export function checkProductBillingReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "BIL-CONSTANTS",
      "foundation",
      "Product billing foundation version constants",
      PRODUCT_BILLING_FOUNDATION_ID ===
        "enterprise-product-billing-foundation-v1" &&
        PRODUCT_BILLING_FOUNDATION_VERSION === "product-billing-1" &&
        PRODUCT_BILLING_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_AUTH_BASELINE_ID &&
        PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION ===
          "product-billing-foundation-freeze-1" &&
        PRODUCT_BILLING_FREEZE_VERSION ===
          "product-billing-foundation-freeze-1" &&
        BILLING_ACCOUNT_STATUSES.length === 3 &&
        BILLING_PLAN_TIERS.length === 3 &&
        INVOICE_STATUSES.length === 4 &&
        PAYMENT_STATUSES.length === 4 &&
        BILLING_READINESS_VERDICTS.length === 3 &&
        BILLING_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_BILLING_FOUNDATION_ID} base=${PRODUCT_BILLING_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
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
      "BIL-AUTH-BASE",
      "product-auth",
      "Auth baseline BASE preserved",
      PRODUCT_BILLING_FOUNDATION_BASE ===
        "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        PRODUCT_AUDIT_TRACEABILITY_ID ===
          "enterprise-product-audit-traceability-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_BILLING_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "BIL-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createBillingManager({ managerId: "prod-bil-gate" });
    mgr.initialize();
    mgr.start();

    const account = mgr.openBillingAccount({
      id: "bil.gate.acc",
      principalId: "id.gate.prn",
      name: "Acme Billing",
      currency: "USD",
    });
    const plan = mgr.registerBillingPlan({
      id: "bil.gate.pln",
      code: "ENT-MO",
      name: "Enterprise Monthly",
      tier: "ENTERPRISE",
      amountCents: 9900,
    });
    const invoice = mgr.issueInvoice({
      id: "bil.gate.inv",
      accountId: account.id,
      planId: plan.id,
    });
    const payment = mgr.capturePayment({
      id: "bil.gate.pay",
      invoiceId: invoice.id,
      succeed: true,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getBillingRegistryManifest();

    const ok =
      payment.status === "CAPTURED" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_BILLING_FOUNDATION_ID &&
      registry.base === PRODUCT_BILLING_FOUNDATION_BASE &&
      registry.accountCount >= 1 &&
      registry.planCount >= 1 &&
      registry.invoiceCount >= 1 &&
      registry.paymentCount >= 1;

    try {
      assertBillingFoundationReadinessReady(readiness);
      checks.push(
        check(
          "BIL-STACK",
          "foundation",
          "Account / plan / invoice / payment",
          ok,
          `readiness=${readiness.verdict} payment=${payment.status}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "BIL-STACK",
          "foundation",
          "Account / plan / invoice / payment",
          false,
          error instanceof Error
            ? error.message
            : "product billing not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "BIL-STACK",
        "foundation",
        "Account / plan / invoice / payment",
        false,
        error instanceof Error
          ? error.message
          : "product billing probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-billing-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductBillingReleaseGatePass(
  gate: ReleaseGateResult = checkProductBillingReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product billing release gate failed: ${gate.summary}`,
    );
  }
}
