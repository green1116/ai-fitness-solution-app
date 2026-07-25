/**
 * Product Payment — Payment Integration Release Gate
 * MODULE: Payment
 * BASE: enterprise-product-usage-metering-v1
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
import { PRODUCT_BILLING_FOUNDATION_ID } from "../../billing/foundation/foundation.constants";
import { PRODUCT_INVOICE_ENGINE_ID } from "../../invoice/engine/engine.constants";
import { PRODUCT_USAGE_METERING_ID } from "../../metering/usage/usage.constants";
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../../pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import {
  INTENT_STATUSES,
  PAYMENT_MANAGER_STATUSES,
  PAYMENT_PROVIDER_KINDS,
  PAYMENT_READINESS_VERDICTS,
  PRODUCT_PAYMENT_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
  PROVIDER_STATUSES,
  REFUND_RESULTS,
} from "../integration/integration.constants";
import {
  assertPaymentIntegrationReadinessReady,
  clearPaymentIntegrationLayer,
  createPaymentManager,
  getPaymentRegistryManifest,
} from "../payment.manager";

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

export const PRODUCT_PAYMENT_SIGNOFF_VERSION =
  "product-payment-signoff-1" as const;

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
  clearPaymentIntegrationLayer();
}

export function checkProductPaymentReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PAY-CONSTANTS",
      "integration",
      "Product payment integration version constants",
      PRODUCT_PAYMENT_INTEGRATION_ID ===
        "enterprise-product-payment-integration-v1" &&
        PRODUCT_PAYMENT_INTEGRATION_VERSION === "product-payment-1" &&
        PRODUCT_PAYMENT_INTEGRATION_BASE === PRODUCT_USAGE_METERING_ID &&
        PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION ===
          "product-payment-integration-freeze-1" &&
        PRODUCT_PAYMENT_FREEZE_VERSION ===
          "product-payment-integration-freeze-1" &&
        PAYMENT_PROVIDER_KINDS.length === 3 &&
        PROVIDER_STATUSES.length === 2 &&
        INTENT_STATUSES.length === 4 &&
        REFUND_RESULTS.length === 3 &&
        PAYMENT_READINESS_VERDICTS.length === 3 &&
        PAYMENT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_PAYMENT_INTEGRATION_ID} base=${PRODUCT_PAYMENT_INTEGRATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PAY-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PAY-MET-BASE",
      "product-metering",
      "Usage metering BASE preserved",
      PRODUCT_PAYMENT_INTEGRATION_BASE ===
        "enterprise-product-usage-metering-v1" &&
        PRODUCT_USAGE_METERING_ID ===
          "enterprise-product-usage-metering-v1" &&
        PRODUCT_INVOICE_ENGINE_ID ===
          "enterprise-product-invoice-engine-v1" &&
        PRODUCT_PRICING_MANAGEMENT_ID ===
          "enterprise-product-pricing-management-v1" &&
        PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
          "enterprise-product-subscription-lifecycle-v1" &&
        PRODUCT_BILLING_FOUNDATION_ID ===
          "enterprise-product-billing-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_PAYMENT_INTEGRATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "PAY-UPSTREAM",
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
    const mgr = createPaymentManager({ managerId: "prod-pay-gate" });
    mgr.initialize();
    mgr.start();

    const provider = mgr.registerProvider({
      id: "pay.gate.prv",
      code: "STRIPE",
      name: "Stripe Card",
      kind: "CARD",
    });
    const intent = mgr.createIntent({
      id: "pay.gate.int",
      providerId: provider.id,
      accountId: "bil.gate.acc",
      amountCents: 27500,
    });
    mgr.authorizeIntent({ intentId: intent.id });
    const capture = mgr.captureIntent({
      id: "pay.gate.cap",
      intentId: intent.id,
    });
    const refund = mgr.refundCapture({
      id: "pay.gate.rfd",
      captureId: capture.id,
      amountCents: 5000,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getPaymentRegistryManifest();

    const ok =
      capture.amountCents === 27500 &&
      refund.result === "PARTIAL" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_PAYMENT_INTEGRATION_ID &&
      registry.base === PRODUCT_PAYMENT_INTEGRATION_BASE &&
      registry.providerCount >= 1 &&
      registry.intentCount >= 1 &&
      registry.captureCount >= 1 &&
      registry.refundCount >= 1;

    try {
      assertPaymentIntegrationReadinessReady(readiness);
      checks.push(
        check(
          "PAY-STACK",
          "integration",
          "Provider / intent / capture / refund",
          ok,
          `readiness=${readiness.verdict} refund=${refund.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PAY-STACK",
          "integration",
          "Provider / intent / capture / refund",
          false,
          error instanceof Error
            ? error.message
            : "product payment not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PAY-STACK",
        "integration",
        "Provider / intent / capture / refund",
        false,
        error instanceof Error
          ? error.message
          : "product payment probe failed",
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
      `product-payment-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductPaymentReleaseGatePass(
  gate: ReleaseGateResult = checkProductPaymentReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product payment release gate failed: ${gate.summary}`,
    );
  }
}
