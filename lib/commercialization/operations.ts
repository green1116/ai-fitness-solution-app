/** RC1 compat entry — @/lib/commercialization/operations */
export {
  OPERATIONS_FOUNDATION_VERSION,
  runCommercialOperationsFoundation,
} from "./_rc1-foundation-compat";

import { runCommercialOperationsFoundation } from "./_rc1-foundation-compat";

type CommercialOperationsFoundationResult = ReturnType<
  typeof runCommercialOperationsFoundation
>;

function operationsReadyHook(
  prefix: string,
  result: CommercialOperationsFoundationResult,
): string {
  return result.operational
    ? `${prefix}=${result.version}`
    : `${prefix}=false`;
}

export function formatOnboardingReadyHook(
  result: CommercialOperationsFoundationResult,
): string {
  return operationsReadyHook("onboarding-ready", result);
}

export function formatOperationsSurfaceReadyHook(
  result: CommercialOperationsFoundationResult,
): string {
  return operationsReadyHook("operations-surface-ready", result);
}

export function formatOrderModelReadyHook(
  result: CommercialOperationsFoundationResult,
): string {
  return operationsReadyHook("order-model-ready", result);
}

export function formatSubscriptionModelReadyHook(
  result: CommercialOperationsFoundationResult,
): string {
  return operationsReadyHook("subscription-model-ready", result);
}

export function formatTrialModelReadyHook(
  result: CommercialOperationsFoundationResult,
): string {
  return operationsReadyHook("trial-model-ready", result);
}
