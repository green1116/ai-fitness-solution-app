import type { CommercialV37HubFoundationResult } from "../hub/hub-surface-summary";
import { buildConsolidationSummary } from "./consolidation-summary";
import { buildFreezeBoundarySummary } from "./freeze-boundary-summary";
import { buildMaintainabilitySummary } from "./maintainability-summary";
import { buildRegressionBaselineSummary } from "./regression-baseline-summary";
import { buildStabilizationReleaseReadiness } from "./stabilization-release-readiness";

export const V37_STABILIZATION_FOUNDATION_VERSION = "3.7-stabilization-17" as const;

export type CommercialV37StabilizationFoundationInput = {
  deploymentId: string;
  v37Hub?: CommercialV37HubFoundationResult;
};

export type CommercialV37StabilizationFoundationResult = {
  version: typeof V37_STABILIZATION_FOUNDATION_VERSION;
  deploymentId: string;
  consolidation: ReturnType<typeof buildConsolidationSummary>;
  freezeBoundary: ReturnType<typeof buildFreezeBoundarySummary>;
  regressionBaseline: ReturnType<typeof buildRegressionBaselineSummary>;
  releaseReadiness: ReturnType<typeof buildStabilizationReleaseReadiness>;
  maintainability: ReturnType<typeof buildMaintainabilitySummary>;
  sealId: string;
  stabilizationReady: boolean;
  summary: string;
};

export function runCommercialV37StabilizationFoundation(
  input: CommercialV37StabilizationFoundationInput,
): CommercialV37StabilizationFoundationResult {
  if (input.v37Hub && !input.v37Hub.hubFreeze.hubFrozen) {
    throw new Error("V37_STABILIZATION_HUB_NOT_FROZEN");
  }

  const hubFrozen = input.v37Hub?.hubFreeze.hubFrozen ?? false;
  const hubReady = input.v37Hub?.hubReady ?? false;
  const terminalLocked = input.v37Hub?.terminalFreeze.terminalLocked ?? false;

  const consolidation = buildConsolidationSummary({
    deploymentId: input.deploymentId,
    hubFrozen,
    hubReady,
  });

  const freezeBoundary = buildFreezeBoundarySummary({
    deploymentId: input.deploymentId,
    hubFrozen,
    terminalLocked,
  });

  const regressionBaseline = buildRegressionBaselineSummary({
    deploymentId: input.deploymentId,
    hubFrozen,
  });

  const releaseReadiness = buildStabilizationReleaseReadiness({
    deploymentId: input.deploymentId,
    hubFrozen,
    consolidationComplete: consolidation.consolidationComplete,
    boundaryLocked: freezeBoundary.boundaryLocked,
    baselineReady: regressionBaseline.baselineReady,
  });

  const stabilizationReady =
    hubFrozen &&
    consolidation.consolidationComplete &&
    freezeBoundary.boundaryLocked &&
    regressionBaseline.baselineReady &&
    releaseReadiness.releaseReady &&
    releaseReadiness.publishable;

  const maintainability = buildMaintainabilitySummary({
    deploymentId: input.deploymentId,
    stabilizationReady,
  });

  const sealId = `SEAL-V37-STAB-${input.deploymentId.slice(0, 8)}`;

  const summary = [
    `v37-stabilization=${V37_STABILIZATION_FOUNDATION_VERSION}`,
    consolidation.summary,
    freezeBoundary.summary,
    regressionBaseline.summary,
    releaseReadiness.summary,
    maintainability.summary,
    `seal=${sealId}`,
    `stabilizationReady=${stabilizationReady}`,
    `deployment=${input.deploymentId}`,
  ].join(" ");

  return {
    version: V37_STABILIZATION_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    consolidation,
    freezeBoundary,
    regressionBaseline,
    releaseReadiness,
    maintainability,
    sealId,
    stabilizationReady,
    summary,
  };
}

export function formatConsolidationReadyHook(
  result: CommercialV37StabilizationFoundationResult,
): string {
  return result.consolidation.consolidationComplete
    ? `consolidation-ready=${result.consolidation.version}`
    : "consolidation-ready=false";
}

export function formatFreezeBoundaryReadyHook(
  result: CommercialV37StabilizationFoundationResult,
): string {
  return result.freezeBoundary.boundaryLocked
    ? `freeze-boundary-ready=${result.freezeBoundary.version}`
    : "freeze-boundary-ready=false";
}

export function formatRegressionBaselineReadyHook(
  result: CommercialV37StabilizationFoundationResult,
): string {
  return result.regressionBaseline.baselineReady
    ? `regression-baseline-ready=${result.regressionBaseline.version}`
    : "regression-baseline-ready=false";
}

export function formatStabilizationReleaseReadyHook(
  result: CommercialV37StabilizationFoundationResult,
): string {
  return result.releaseReadiness.releaseReady
    ? `stabilization-release-ready=${result.releaseReadiness.version}`
    : "stabilization-release-ready=false";
}

export function formatStabilizationSurfaceReadyHook(
  result: CommercialV37StabilizationFoundationResult,
): string {
  return result.stabilizationReady
    ? `stabilization-surface-ready=${result.version}`
    : "stabilization-surface-ready=false";
}
