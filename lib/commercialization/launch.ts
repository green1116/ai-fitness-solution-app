/** RC1 compat entry — @/lib/commercialization/launch */
export { runCommercialV37LaunchFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37LaunchFoundation } from "./_rc1-foundation-compat";

type CommercialV37LaunchFoundationResult = ReturnType<
  typeof runCommercialV37LaunchFoundation
>;

function v37LaunchVersionToken(
  result: CommercialV37LaunchFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-launch-9";
}

function v37LaunchReadyHook(
  prefix: string,
  result: CommercialV37LaunchFoundationResult,
): string {
  return `${prefix}=${v37LaunchVersionToken(result)}`;
}

export function formatHandoffReadyHook(
  result: CommercialV37LaunchFoundationResult,
): string {
  return v37LaunchReadyHook("handoff-ready", result);
}

export function formatLaunchCandidateReadyHook(
  result: CommercialV37LaunchFoundationResult,
): string {
  return v37LaunchReadyHook("launch-candidate-ready", result);
}

export function formatLaunchSurfaceReadyHook(
  result: CommercialV37LaunchFoundationResult,
): string {
  return v37LaunchReadyHook("launch-surface-ready", result);
}

export function formatMaintenanceReadyHook(
  result: CommercialV37LaunchFoundationResult,
): string {
  return v37LaunchReadyHook("maintenance-ready", result);
}

export function formatPublicReadinessReadyHook(
  result: CommercialV37LaunchFoundationResult,
): string {
  return v37LaunchReadyHook("public-readiness-ready", result);
}
