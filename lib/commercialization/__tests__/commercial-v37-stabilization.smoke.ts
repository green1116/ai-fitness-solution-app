/**
 * V3.7 Final stabilization — smoke (RC1 fixture, no full commercial stack)
 */
import {
  V37_HUB_FOUNDATION_VERSION,
  type CommercialV37HubFoundationResult,
} from "../hub/hub-surface-summary";
import {
  runCommercialV37StabilizationFoundation,
  formatConsolidationReadyHook,
  formatFreezeBoundaryReadyHook,
  formatRegressionBaselineReadyHook,
  formatStabilizationReleaseReadyHook,
  formatStabilizationSurfaceReadyHook,
  V37_STABILIZATION_FOUNDATION_VERSION,
} from "../stabilization";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function buildFrozenHubFixture(deploymentId: string): CommercialV37HubFoundationResult {
  return {
    version: V37_HUB_FOUNDATION_VERSION,
    deploymentId,
    hubReady: true,
    hubFreeze: { hubFrozen: true },
    terminalFreeze: { terminalLocked: true },
  };
}

function main(): void {
  const hub = buildFrozenHubFixture("stab-smoke");

  const stab = runCommercialV37StabilizationFoundation({
    deploymentId: "stab-smoke",
    v37Hub: hub,
  });
  assert(stab.stabilizationReady, "stabilization ready");
  assert(stab.version === V37_STABILIZATION_FOUNDATION_VERSION, "version");
  assert(stab.releaseReadiness.publishable, "publishable");

  let threw = false;
  try {
    runCommercialV37StabilizationFoundation({
      deploymentId: "bad",
      v37Hub: {
        ...hub,
        hubFreeze: { hubFrozen: false },
      },
    });
  } catch {
    threw = true;
  }
  assert(threw, "rejects hub not frozen");

  console.log("=== Commercial V3.7 Stabilization Smoke ===");
  console.log(stab.summary);
  console.log(formatConsolidationReadyHook(stab));
  console.log(formatFreezeBoundaryReadyHook(stab));
  console.log(formatRegressionBaselineReadyHook(stab));
  console.log(formatStabilizationReleaseReadyHook(stab));
  console.log(formatStabilizationSurfaceReadyHook(stab));
  console.log("SMOKE OK");
}

main();
