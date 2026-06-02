/** RC1 compat entry — @/lib/commercialization/closure */
export {
  CLOSURE_FOUNDATION_VERSION,
  runCommercialClosureFoundation,
  runCommercialV37ClosureFoundation,
  type CommercialClosureFoundationResult,
} from "./_rc1-foundation-compat";

import type { CommercialClosureFoundationResult } from "./_rc1-foundation-compat";
import { runCommercialV37ClosureFoundation } from "./_rc1-foundation-compat";

export function formatArchiveReadyHook(
  result: CommercialClosureFoundationResult,
): string {
  return `archive-ready=${result.version} ready=${result.archiveReadiness.ready}`;
}

export function formatSurfaceSealedHook(
  result: CommercialClosureFoundationResult,
): string {
  const seal = result.surfaceSeal;
  return [
    `surface-sealed=${result.version}`,
    `sealed=${result.sealed}`,
    `v35=${seal.v35FreezeIntact}`,
    `v36-public=${seal.v36PublicOnly}`,
    `no-runtime-expansion=${seal.noRuntimeExpansion}`,
  ].join(" ");
}

export function formatV36PhaseClosedHook(
  result: CommercialClosureFoundationResult,
): string {
  return [
    `v36-phase-closed=${result.version}`,
    `closed=${result.closed}`,
    `sealed=${result.sealed}`,
  ].join(" ");
}

export function formatVersionLockReadyHook(
  result: CommercialClosureFoundationResult,
): string {
  return [
    `version-lock-ready=${result.version}`,
    `deploymentId=${result.deploymentId}`,
    `locked=${result.sealed}`,
  ].join(" ");
}

type CommercialV37ClosureFoundationResult = ReturnType<
  typeof runCommercialV37ClosureFoundation
>;

function v37ClosureReadyHook(
  prefix: string,
  result: CommercialV37ClosureFoundationResult,
): string {
  const versionToken = result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-closure-1";
  return result.closed
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatV37ClosureReadyHook(
  result: CommercialV37ClosureFoundationResult,
): string {
  return v37ClosureReadyHook("v37-closure-ready", result);
}

export function formatV37FreezeReadyHook(
  result: CommercialV37ClosureFoundationResult,
): string {
  return v37ClosureReadyHook("v37-freeze-ready", result);
}

export function formatV37PhaseClosedHook(
  result: CommercialV37ClosureFoundationResult,
): string {
  return v37ClosureReadyHook("v37-phase-closed", result);
}

export function formatV37RegistryReadyHook(
  result: CommercialV37ClosureFoundationResult,
): string {
  return v37ClosureReadyHook("v37-registry-ready", result);
}

export function formatV37SurfaceSealedHook(
  result: CommercialV37ClosureFoundationResult,
): string {
  return v37ClosureReadyHook("v37-surface-sealed", result);
}
