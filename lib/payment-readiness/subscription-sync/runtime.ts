import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildSubscriptionSyncLifecycle,
  buildSubscriptionSyncTransitions,
  SUBSCRIPTION_SYNC_ACTIONS,
} from "./transitions";
import type { SubscriptionSyncRuntimePayload } from "./types";
import { SUBSCRIPTION_SYNC_RUNTIME_VERSION } from "./types";

export function validateSubscriptionSyncRuntime(input?: {
  deploymentId?: string;
}): {
  transitionsValid: boolean;
  lifecycleValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "subscription-sync-default";
  const transitions = buildSubscriptionSyncTransitions();
  const lifecycle = buildSubscriptionSyncLifecycle({ deploymentId });
  const actions = new Set(transitions.map((t) => t.action));

  return {
    transitionsValid:
      transitions.length === SUBSCRIPTION_SYNC_ACTIONS.length &&
      SUBSCRIPTION_SYNC_ACTIONS.every((action) => actions.has(action)),
    lifecycleValid:
      lifecycle.length === SUBSCRIPTION_SYNC_ACTIONS.length &&
      lifecycle.every((event) => event.mode === "readiness-stub"),
  };
}

export function runSubscriptionSyncRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<SubscriptionSyncRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "subscription-sync-default";
  const stages: PaymentReadinessStageResult[] = [];

  const transitions = runStage(
    "subscription-sync-transitions",
    "Subscription Sync Transitions",
    () => buildSubscriptionSyncTransitions(),
    stages,
  );
  const lifecycle = runStage(
    "subscription-sync-lifecycle",
    "Subscription Sync Lifecycle",
    () => buildSubscriptionSyncLifecycle({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "subscription-sync-validate",
    "Subscription Sync Validation",
    () => validateSubscriptionSyncRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Subscription sync runtime validation failed");
  }

  const payload: SubscriptionSyncRuntimePayload = {
    version: SUBSCRIPTION_SYNC_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    transitions,
    lifecycle,
    summary: `subscription-sync-runtime actions=${transitions.length} lifecycle=${lifecycle.length}`,
  };

  return finalizeRuntime({
    domain: "subscription-sync",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
