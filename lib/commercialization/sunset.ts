/** RC1 compat entry — @/lib/commercialization/sunset */
export { runCommercialV37SunsetFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37SunsetFoundation } from "./_rc1-foundation-compat";

type CommercialV37SunsetFoundationResult = ReturnType<
  typeof runCommercialV37SunsetFoundation
>;

function v37SunsetVersionToken(
  result: CommercialV37SunsetFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-sunset-11";
}

function v37SunsetReadyHook(
  prefix: string,
  result: CommercialV37SunsetFoundationResult,
): string {
  return `${prefix}=${v37SunsetVersionToken(result)}`;
}

export function formatAuditTrailReadyHook(
  result: CommercialV37SunsetFoundationResult,
): string {
  return v37SunsetReadyHook("audit-trail-ready", result);
}

export function formatDecommissionReadyHook(
  result: CommercialV37SunsetFoundationResult,
): string {
  return v37SunsetReadyHook("decommission-ready", result);
}

export function formatRetentionReadyHook(
  result: CommercialV37SunsetFoundationResult,
): string {
  return v37SunsetReadyHook("retention-ready", result);
}

export function formatSunsetReadyHook(
  result: CommercialV37SunsetFoundationResult,
): string {
  return v37SunsetReadyHook("sunset-ready", result);
}

export function formatSunsetSurfaceReadyHook(
  result: CommercialV37SunsetFoundationResult,
): string {
  return v37SunsetReadyHook("sunset-surface-ready", result);
}
