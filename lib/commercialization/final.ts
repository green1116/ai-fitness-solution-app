/** RC1 compat entry — @/lib/commercialization/final */
export { runCommercialV37FinalFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37FinalFoundation } from "./_rc1-foundation-compat";

type CommercialV37FinalFoundationResult = ReturnType<
  typeof runCommercialV37FinalFoundation
>;

function v37FinalVersionToken(result: CommercialV37FinalFoundationResult): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-final-7";
}

function v37FinalReadyHook(
  prefix: string,
  result: CommercialV37FinalFoundationResult,
): string {
  const versionToken = v37FinalVersionToken(result);
  return result.finalized
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatFinalSurfaceReadyHook(
  result: CommercialV37FinalFoundationResult,
): string {
  return v37FinalReadyHook("final-surface-ready", result);
}

export function formatPublicIndexReadyHook(
  result: CommercialV37FinalFoundationResult,
): string {
  return result.readiness.ready
    ? `public-index-ready=${v37FinalVersionToken(result)}`
    : "public-index-ready=false";
}

export function formatReleasePackReadyHook(
  result: CommercialV37FinalFoundationResult,
): string {
  return v37FinalReadyHook("release-pack-ready", result);
}

export function formatStableFreezeReadyHook(
  result: CommercialV37FinalFoundationResult,
): string {
  const versionToken = v37FinalVersionToken(result);
  return result.stableFreeze.v36Sealed && result.finalized
    ? `stable-freeze-ready=${versionToken}`
    : "stable-freeze-ready=false";
}

export function formatV37FinalClosedHook(
  result: CommercialV37FinalFoundationResult,
): string {
  return v37FinalReadyHook("v37-final-closed", result);
}
