/** RC1 compat entry — @/lib/commercialization/v37 */
export {
  EXPECTED_V37_PHASE_HOOKS,
  runCommercialV37PhaseClosureFoundation,
} from "./_rc1-foundation-compat";

import { runCommercialV37PhaseClosureFoundation } from "./_rc1-foundation-compat";

type CommercialV37PhaseClosureFoundationResult = ReturnType<
  typeof runCommercialV37PhaseClosureFoundation
>;

function v37PhaseVersionToken(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  return result.summary.includes("=")
    ? result.summary.split("=").slice(1).join("=")
    : "3.7-phase-closure-8";
}

function v37PhaseReadyHook(
  prefix: string,
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  const versionToken = v37PhaseVersionToken(result);
  return result.phaseClosed
    ? `${prefix}=${versionToken}`
    : `${prefix}=false`;
}

export function formatAggregateVerificationReadyHook(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  const versionToken = v37PhaseVersionToken(result);
  return result.aggregate.complete
    ? `aggregate-verification-ready=${versionToken}`
    : "aggregate-verification-ready=false";
}

export function formatCommercialProductizationPhaseClosedHook(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  return v37PhaseReadyHook("commercial-productization-phase-closed", result);
}

export function formatSurfaceLockReadyHook(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  return v37PhaseReadyHook("surface-lock-ready", result);
}

export function formatVersionFreezeReadyHook(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  return v37PhaseReadyHook("version-freeze-ready", result);
}

export function formatV37PhaseClosureReadyHook(
  result: CommercialV37PhaseClosureFoundationResult,
): string {
  return v37PhaseReadyHook("v37-phase-closure-ready", result);
}
