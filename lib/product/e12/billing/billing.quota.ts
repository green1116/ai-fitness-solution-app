/**
 * E12-P4 — Quota Billing
 * Evaluates usage against pricing plan quotas
 */

import { getPricingPlan } from "./billing.plan";
import { getBillingSubscription } from "./billing.subscription";
import { getUsageTotal } from "./billing.usage";
import type { QuotaBillingResult, UsageMeterUnit } from "./billing.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function evaluateQuotaBilling(input: {
  billingSubscriptionId: string;
  meter: UsageMeterUnit;
}): QuotaBillingResult {
  const billingSubscriptionId = input.billingSubscriptionId.trim();
  const meter = input.meter;

  const sub = getBillingSubscription(billingSubscriptionId);
  if (!sub) {
    throw new Error(`billing subscription not found: ${billingSubscriptionId}`);
  }

  const plan = getPricingPlan(sub.pricingPlanId);
  if (!plan) throw new Error(`pricing plan not found: ${sub.pricingPlanId}`);

  const quota = plan.quotas.find((q) => q.meter === meter);
  if (!quota) {
    return {
      productTenantId: sub.productTenantId,
      billingSubscriptionId,
      meter,
      status: "WITHIN_QUOTA",
      included: 0,
      used: 0,
      overage: 0,
      overageCharge: 0,
      evaluatedAt: nowIso(),
    };
  }

  const used = getUsageTotal({ billingSubscriptionId, meter });
  const overage = Math.max(0, used - quota.included);
  const overageCharge = overage * quota.overageRate;

  let status: QuotaBillingResult["status"] = "WITHIN_QUOTA";
  if (overage > 0) status = "OVERAGE";
  if (sub.status === "PAST_DUE" && overage > 0) status = "SUSPENDED";

  return {
    productTenantId: sub.productTenantId,
    billingSubscriptionId,
    meter,
    status,
    included: quota.included,
    used,
    overage,
    overageCharge,
    evaluatedAt: nowIso(),
  };
}

export function evaluateAllQuotaBilling(
  billingSubscriptionId: string,
): QuotaBillingResult[] {
  const sub = getBillingSubscription(billingSubscriptionId);
  if (!sub) throw new Error(`billing subscription not found: ${billingSubscriptionId}`);
  const plan = getPricingPlan(sub.pricingPlanId);
  if (!plan) throw new Error(`pricing plan not found: ${sub.pricingPlanId}`);

  return plan.quotas.map((q) =>
    evaluateQuotaBilling({ billingSubscriptionId, meter: q.meter }),
  );
}
