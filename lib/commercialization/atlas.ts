/** RC1 compat entry — @/lib/commercialization/atlas */
export { runCommercialV37AtlasFoundation } from "./_rc1-foundation-compat";

import { runCommercialV37AtlasFoundation } from "./_rc1-foundation-compat";

type CommercialV37AtlasFoundationResult = ReturnType<
  typeof runCommercialV37AtlasFoundation
>;

function v37AtlasVersionToken(
  result: CommercialV37AtlasFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-atlas-14";
}

function v37AtlasReadyHook(
  prefix: string,
  result: CommercialV37AtlasFoundationResult,
): string {
  const versionToken = v37AtlasVersionToken(result);
  return result.atlasReady
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatFullLifecycleMapReadyHook(
  result: CommercialV37AtlasFoundationResult,
): string {
  return v37AtlasReadyHook("full-lifecycle-map-ready", result);
}

export function formatMasterAtlasReadyHook(
  result: CommercialV37AtlasFoundationResult,
): string {
  return v37AtlasReadyHook("master-atlas-ready", result);
}

export function formatMasterSurfaceReadyHook(
  result: CommercialV37AtlasFoundationResult,
): string {
  return v37AtlasReadyHook("master-surface-ready", result);
}

export function formatPublicOverviewReadyHook(
  result: CommercialV37AtlasFoundationResult,
): string {
  return v37AtlasReadyHook("public-overview-ready", result);
}

export function formatUnifiedIndexReadyHook(
  result: CommercialV37AtlasFoundationResult,
): string {
  return v37AtlasReadyHook("unified-index-ready", result);
}
