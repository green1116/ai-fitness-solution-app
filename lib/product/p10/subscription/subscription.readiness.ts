/**
 * Product P10 — Subscription & Billing readiness
 */

import { PRODUCT_P9_CUSTOMER_SUCCESS_ID } from "../../p9/customer-health/health.constants";
import { listBilling } from "../billing/billing.registry";
import { listEntitlements } from "../entitlement/entitlement.registry";
import { listInvoices } from "../invoice/invoice.registry";
import { listPayments } from "../payment/payment.registry";
import { listPlans } from "../plan/plan.registry";
import { listPricing } from "../pricing/pricing.registry";
import { listQuotas } from "../quota/quota.registry";
import { PRODUCT_P10_SUBSCRIPTION_BILLING_BASE } from "./subscription.constants";
import { listSubscriptions } from "./subscription.registry";
import type {
  P10ReadinessCheck,
  P10ReadinessResult,
} from "./subscription.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P10ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP10SubscriptionBillingReadiness(): P10ReadinessResult {
  const checks: P10ReadinessCheck[] = [];

  checks.push(
    check(
      "P10-BASE",
      "foundation",
      "P9 customer success baseline aligned",
      PRODUCT_P10_SUBSCRIPTION_BILLING_BASE === PRODUCT_P9_CUSTOMER_SUCCESS_ID,
      `base=${PRODUCT_P10_SUBSCRIPTION_BILLING_BASE}`,
    ),
  );

  const subscriptions = listSubscriptions();
  checks.push(
    check(
      "P10-SUB",
      "subscription",
      "Subscriptions present",
      subscriptions.length >= 1,
      `subscriptions=${subscriptions.length}`,
    ),
  );

  const plans = listPlans();
  checks.push(
    check(
      "P10-PLN",
      "plan",
      "Plans present",
      plans.length >= 1,
      `plans=${plans.length}`,
    ),
  );

  const pricing = listPricing();
  checks.push(
    check(
      "P10-PRC",
      "pricing",
      "Pricing present",
      pricing.length >= 1,
      `pricing=${pricing.length}`,
    ),
  );

  const billing = listBilling();
  checks.push(
    check(
      "P10-BIL",
      "billing",
      "Billing cycles present",
      billing.length >= 1,
      `billing=${billing.length}`,
    ),
  );

  const invoices = listInvoices();
  checks.push(
    check(
      "P10-INV",
      "invoice",
      "Invoices paid",
      invoices.some((i) => i.status === "PAID" || i.status === "ISSUED"),
      `invoices=${invoices.length}`,
    ),
  );

  const payments = listPayments();
  checks.push(
    check(
      "P10-PAY",
      "payment",
      "Payments captured",
      payments.some((p) => p.status === "CAPTURED"),
      `payments=${payments.length}`,
    ),
  );

  const entitlements = listEntitlements();
  checks.push(
    check(
      "P10-ENT",
      "entitlement",
      "Entitlements granted",
      entitlements.some((e) => e.enabled),
      `entitlements=${entitlements.length}`,
    ),
  );

  const quotas = listQuotas();
  checks.push(
    check(
      "P10-QTA",
      "quota",
      "Quotas present",
      quotas.length >= 1,
      `quotas=${quotas.length}`,
    ),
  );

  const active = subscriptions.some(
    (s) => s.status === "ACTIVE" || s.status === "TRIAL",
  );
  checks.push(
    check(
      "P10-LIFE",
      "subscription",
      "Subscription lifecycle advanced",
      active,
      `active=${active}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `p10-subscription-billing readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP10SubscriptionBillingReadinessReady(
  result: P10ReadinessResult,
): asserts result is P10ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p10 subscription billing not ready: ${result.summary}`,
    );
  }
}
