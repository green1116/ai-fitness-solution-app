/** RC1 compat entry — @/lib/commercialization/hub */
export {
  V37_HUB_FOUNDATION_VERSION,
  runCommercialV37HubFoundation,
  assertHubReadonlySurface,
} from "./_rc1-foundation-compat";

export { runCommercialV37StabilizationFoundation } from "./stabilization";

import {
  V37_HUB_FOUNDATION_VERSION,
  runCommercialV37HubFoundation,
} from "./_rc1-foundation-compat";

type CommercialV37HubFoundationResult = ReturnType<
  typeof runCommercialV37HubFoundation
>;

type HubFreezeResult = CommercialV37HubFoundationResult["hubFreeze"];

function v37HubReadyHook(
  prefix: string,
  result: CommercialV37HubFoundationResult,
): string {
  return result.hubReady
    ? `${prefix}=${result.version}`
    : `${prefix}=false`;
}

export function formatCanonicalReferenceReadyHook(
  result: CommercialV37HubFoundationResult,
): string {
  return result.canonicalReference.complete
    ? `canonical-reference-ready=${result.version}`
    : "canonical-reference-ready=false";
}

export function formatFinalFreezeReadyHook(
  result: CommercialV37HubFoundationResult,
): string {
  const frozen =
    result.finalFreeze.terminalFreeze && !result.finalFreeze.expansionAllowed;
  return frozen
    ? `final-freeze-ready=${result.version}`
    : "final-freeze-ready=false";
}

export function formatHubSurfaceReadyHook(
  result: CommercialV37HubFoundationResult,
): string {
  return v37HubReadyHook("hub-surface-ready", result);
}

export function formatImmutableEntryReadyHook(
  result: CommercialV37HubFoundationResult,
): string {
  return result.immutableEntry.sealed
    ? `immutable-entry-ready=${result.version}`
    : "immutable-entry-ready=false";
}

export function formatUnifiedPortalReadyHook(
  result: CommercialV37HubFoundationResult,
): string {
  return result.unifiedPortal.navigable && result.unifiedPortal.mutable === false
    ? `unified-portal-ready=${result.version}`
    : "unified-portal-ready=false";
}

export function formatHubFreezeReadyHook(result: HubFreezeResult): string {
  return result.hubFrozen
    ? `hub-freeze-ready=${V37_HUB_FOUNDATION_VERSION}`
    : "hub-freeze-ready=false";
}
