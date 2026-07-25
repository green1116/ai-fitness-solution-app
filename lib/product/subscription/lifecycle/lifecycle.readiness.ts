/**
 * Product Subscription — readiness
 */

import { PRODUCT_BILLING_FOUNDATION_ID } from "../../billing/foundation/foundation.constants";
import { listEntitlements } from "../entitlement/entitlement.registry";
import { listChanges } from "../change/change.registry";
import { listRenewals } from "../renewal/renewal.registry";
import { listSubscriptions } from "../subscription/subscription.registry";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE } from "./lifecycle.constants";
import type {
  SubscriptionReadinessCheck,
  SubscriptionReadinessResult,
} from "./lifecycle.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SubscriptionReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSubscriptionLifecycleReadiness(): SubscriptionReadinessResult {
  const checks: SubscriptionReadinessCheck[] = [];

  checks.push(
    check(
      "SUB-BASE",
      "foundation",
      "Billing foundation baseline aligned",
      PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE === PRODUCT_BILLING_FOUNDATION_ID,
      `base=${PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE}`,
    ),
  );

  const subscriptions = listSubscriptions();
  checks.push(
    check(
      "SUB-SUB",
      "subscription",
      "Active subscriptions present",
      subscriptions.some((s) => s.status === "ACTIVE"),
      `subscriptions=${subscriptions.length}`,
    ),
  );

  const entitlements = listEntitlements();
  checks.push(
    check(
      "SUB-ENT",
      "entitlement",
      "Granted entitlements present",
      entitlements.some((e) => e.status === "GRANTED"),
      `entitlements=${entitlements.length}`,
    ),
  );

  const renewals = listRenewals();
  checks.push(
    check(
      "SUB-REN",
      "renewal",
      "Successful renewals present",
      renewals.some((r) => r.result === "RENEWED"),
      `renewals=${renewals.length}`,
    ),
  );

  const changes = listChanges();
  checks.push(
    check(
      "SUB-CHG",
      "change",
      "Subscription changes present",
      changes.length >= 1,
      `changes=${changes.length}`,
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
    summary: `product-subscription readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertSubscriptionLifecycleReadinessReady(
  result: SubscriptionReadinessResult,
): asserts result is SubscriptionReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product subscription lifecycle not ready: ${result.summary}`,
    );
  }
}
