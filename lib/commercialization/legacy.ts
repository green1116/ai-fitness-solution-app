/** RC1 compat entry — @/lib/commercialization/legacy */
export { runCommercialV37LegacyFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37LegacyFoundation } from "./_rc1-foundation-compat";

type CommercialV37LegacyFoundationResult = ReturnType<
  typeof runCommercialV37LegacyFoundation
>;

function v37LegacyVersionToken(
  result: CommercialV37LegacyFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-legacy-13";
}

function v37LegacyReadyHook(
  prefix: string,
  result: CommercialV37LegacyFoundationResult,
): string {
  const versionToken = v37LegacyVersionToken(result);
  return result.legacyReady
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatEndOfLifeReadyHook(
  result: CommercialV37LegacyFoundationResult,
): string {
  return v37LegacyReadyHook("end-of-life-ready", result);
}

export function formatImmutableReferenceReadyHook(
  result: CommercialV37LegacyFoundationResult,
): string {
  return v37LegacyReadyHook("immutable-reference-ready", result);
}

export function formatLegacySupportReadyHook(
  result: CommercialV37LegacyFoundationResult,
): string {
  return v37LegacyReadyHook("legacy-support-ready", result);
}

export function formatPublicHistoryReadyHook(
  result: CommercialV37LegacyFoundationResult,
): string {
  return v37LegacyReadyHook("public-history-ready", result);
}

export function formatTerminalSurfaceReadyHook(
  result: CommercialV37LegacyFoundationResult,
): string {
  return v37LegacyReadyHook("terminal-surface-ready", result);
}
