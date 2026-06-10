import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import {
  buildSubscriptionPlans,
  buildSubscriptionRenewals,
  buildSubscriptions,
} from "./builders";
import type { SubscriptionRuntimePayload } from "./types";
import { SUBSCRIPTION_RUNTIME_VERSION } from "./types";

export function validateSubscriptionRuntime(input?: { deploymentId?: string }): {
  plansValid: boolean;
  subscriptionsValid: boolean;
  renewalsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  const plans = buildSubscriptionPlans({ deploymentId });
  const subscriptions = buildSubscriptions({ deploymentId });
  const renewals = buildSubscriptionRenewals({ deploymentId });
  const cycles = new Set(plans.map((plan) => plan.cycle));

  return {
    plansValid:
      plans.length === 3 &&
      cycles.has("monthly") &&
      cycles.has("annual") &&
      cycles.has("enterprise"),
    subscriptionsValid:
      subscriptions.length === 3 &&
      subscriptions.every(
        (sub) =>
          sub.subscriptionId.length > 0 &&
          sub.currentPeriodEnd > sub.currentPeriodStart,
      ),
    renewalsValid:
      renewals.length === subscriptions.length &&
      renewals.every(
        (renewal) =>
          renewal.renewalAmount > 0 &&
          renewal.nextRenewalAt.length > 0,
      ),
  };
}

export function runSubscriptionRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<SubscriptionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "subscription-default";
  const stages: RevenueStageResult[] = [];

  const plans = runStage(
    "subscription-plans",
    "Subscription Plans",
    () => buildSubscriptionPlans({ deploymentId }),
    stages,
  );
  const subscriptions = runStage(
    "subscription-models",
    "Subscription Models",
    () => buildSubscriptions({ deploymentId }),
    stages,
  );
  const renewals = runStage(
    "subscription-renewal",
    "Subscription Renewal",
    () => buildSubscriptionRenewals({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "subscription-validate",
    "Subscription Validation",
    () => validateSubscriptionRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Subscription runtime validation failed");
  }

  const payload: SubscriptionRuntimePayload = {
    version: SUBSCRIPTION_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    plans,
    subscriptions,
    renewals,
    summary: `subscription-runtime plans=${plans.length} active=${subscriptions.length} renewals=${renewals.length}`,
  };

  return finalizeRuntime({
    domain: "subscription",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
