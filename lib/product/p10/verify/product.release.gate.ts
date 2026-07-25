/**
 * Product P10 — Subscription & Billing Release Gate
 * BASE: enterprise-product-p9-customer-success-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P9_CUSTOMER_SUCCESS_ID } from "../../p9/customer-health/health.constants";
import {
  BILLING_STATUSES,
  ENTITLEMENT_KINDS,
  INVOICE_STATUSES,
  P10_MANAGER_STATUSES,
  P10_READINESS_VERDICTS,
  PAYMENT_STATUSES,
  PLAN_TIERS,
  PRICING_BILLING_CYCLES,
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
  PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION,
  QUOTA_UNITS,
  SUBSCRIPTION_STATUSES,
} from "../subscription/subscription.constants";
import {
  assertP10SubscriptionBillingReadinessReady,
  clearP10SubscriptionBillingLayer,
  createP10SubscriptionManager,
  getP10RegistryManifest,
} from "../subscription.manager";

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

export const PRODUCT_P10_SIGNOFF_VERSION = "product-p10-signoff-1" as const;

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
  clearP10SubscriptionBillingLayer();
}

export function checkProductP10ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P10-CONSTANTS",
      "subscription",
      "Product P10 subscription & billing version constants",
      PRODUCT_P10_SUBSCRIPTION_BILLING_ID ===
        "enterprise-product-p10-subscription-billing-v1" &&
        PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION === "product-p10-1" &&
        PRODUCT_P10_SUBSCRIPTION_BILLING_BASE ===
          PRODUCT_P9_CUSTOMER_SUCCESS_ID &&
        PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION ===
          "product-p10-subscription-billing-freeze-1" &&
        PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION ===
          "product-p10-subscription-billing-freeze-1" &&
        SUBSCRIPTION_STATUSES.length === 6 &&
        PLAN_TIERS.length === 4 &&
        PRICING_BILLING_CYCLES.length === 4 &&
        BILLING_STATUSES.length === 5 &&
        INVOICE_STATUSES.length === 5 &&
        PAYMENT_STATUSES.length === 4 &&
        ENTITLEMENT_KINDS.length === 5 &&
        QUOTA_UNITS.length === 5 &&
        P10_READINESS_VERDICTS.length === 3 &&
        P10_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P10_SUBSCRIPTION_BILLING_ID} base=${PRODUCT_P10_SUBSCRIPTION_BILLING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P10-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P10-P9-BASE",
      "product-p9",
      "P9 customer success BASE preserved",
      PRODUCT_P10_SUBSCRIPTION_BILLING_BASE ===
        "enterprise-product-p9-customer-success-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P10_SUBSCRIPTION_BILLING_BASE}`,
    ),
  );

  checks.push(
    check(
      "P10-UPSTREAM",
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
    const mgr = createP10SubscriptionManager({ managerId: "prod-p10-gate" });
    mgr.initialize();
    mgr.start();

    const plan = mgr.registerPlan({
      id: "p10.gate.pln",
      tier: "ENTERPRISE",
      name: "Enterprise Coach Platform",
      features: ["AI programming", "Multi-site", "Priority support"],
    });
    const pricing = mgr.createPricing({
      id: "p10.gate.prc",
      planId: plan.id,
      cycle: "ANNUAL",
      currency: "USD",
      unitPrice: 180000,
    });
    const subscription = mgr.createSubscription({
      id: "p10.gate.sub",
      accountRef: "acme-fitness",
      healthRef: "p9.gate.hlt",
      owner: "billing.ops",
      planId: plan.id,
    });
    mgr.updateSubscriptionStatus({
      subscriptionId: subscription.id,
      status: "ACTIVE",
    });
    const billing = mgr.openBilling({
      id: "p10.gate.bil",
      subscriptionId: subscription.id,
      pricingId: pricing.id,
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      amount: pricing.unitPrice,
    });
    mgr.updateBillingStatus({
      billingId: billing.id,
      status: "INVOICED",
    });
    const invoice = mgr.issueInvoice({
      id: "p10.gate.inv",
      billingId: billing.id,
      number: "INV-ACME-2026-001",
    });
    mgr.capturePayment({
      id: "p10.gate.pay",
      invoiceId: invoice.id,
      method: "ACH",
    });
    mgr.updateInvoiceStatus({
      invoiceId: invoice.id,
      status: "PAID",
    });
    mgr.updateBillingStatus({
      billingId: billing.id,
      status: "SETTLED",
    });
    mgr.grantEntitlement({
      id: "p10.gate.ent",
      subscriptionId: subscription.id,
      kind: "MODULE",
      code: "ai-coach-console",
    });
    const quota = mgr.createQuota({
      id: "p10.gate.qta",
      subscriptionId: subscription.id,
      unit: "SEATS",
      limit: 50,
      used: 0,
    });
    mgr.consumeQuota({
      quotaId: quota.id,
      amount: 12,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP10RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P10_SUBSCRIPTION_BILLING_ID &&
      registry.base === PRODUCT_P10_SUBSCRIPTION_BILLING_BASE &&
      registry.subscriptionCount >= 1 &&
      registry.planCount >= 1 &&
      registry.pricingCount >= 1 &&
      registry.billingCount >= 1 &&
      registry.invoiceCount >= 1 &&
      registry.paymentCount >= 1 &&
      registry.entitlementCount >= 1 &&
      registry.quotaCount >= 1;

    try {
      assertP10SubscriptionBillingReadinessReady(readiness);
      checks.push(
        check(
          "P10-STACK",
          "subscription",
          "Subscription / plan / pricing / billing / invoice / payment / entitlement / quota",
          ok,
          `readiness=${readiness.verdict} payments=${registry.paymentCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P10-STACK",
          "subscription",
          "Subscription / plan / pricing / billing / invoice / payment / entitlement / quota",
          false,
          error instanceof Error
            ? error.message
            : "p10 subscription billing not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P10-STACK",
        "subscription",
        "Subscription / plan / pricing / billing / invoice / payment / entitlement / quota",
        false,
        error instanceof Error
          ? error.message
          : "p10 subscription billing probe failed",
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
      `product-p10-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP10ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP10ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P10 release gate failed: ${gate.summary}`);
  }
}
