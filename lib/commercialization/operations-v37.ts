/** RC1 compat entry — @/lib/commercialization/operations-v37 */
export { runCommercialV37OperatingFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37OperatingFoundation } from "./_rc1-foundation-compat";

type CommercialV37OperatingFoundationResult = ReturnType<
  typeof runCommercialV37OperatingFoundation
>;

function v37OperatingVersionToken(
  result: CommercialV37OperatingFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-operations-10";
}

function v37OperatingReadyHook(
  prefix: string,
  result: CommercialV37OperatingFoundationResult,
): string {
  return `${prefix}=${v37OperatingVersionToken(result)}`;
}

export function formatArchiveReadyHook(
  result: CommercialV37OperatingFoundationResult,
): string {
  return v37OperatingReadyHook("v37-operating-archive-ready", result);
}

export function formatLongTermSupportReadyHook(
  result: CommercialV37OperatingFoundationResult,
): string {
  return v37OperatingReadyHook("long-term-support-ready", result);
}

export function formatOperatingStateReadyHook(
  result: CommercialV37OperatingFoundationResult,
): string {
  return v37OperatingReadyHook("operating-state-ready", result);
}

export function formatOperatingSurfaceReadyHook(
  result: CommercialV37OperatingFoundationResult,
): string {
  return v37OperatingReadyHook("operating-surface-ready", result);
}

export function formatRenewalReadyHook(
  result: CommercialV37OperatingFoundationResult,
): string {
  return v37OperatingReadyHook("renewal-ready", result);
}
