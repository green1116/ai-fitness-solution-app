/**
 * V64 P7 — Commercial verification report builder
 */
import { validateCommercialCapability } from "./capability.validate";
import { validateCommercialCatalog } from "./catalog.validate";
import { validateCommercialFeatureMatrix } from "./feature.validate";
import { validateCommercialFoundation } from "./foundation";
import { validateCommercialPricing } from "./pricing.validate";
import { validateCommercialTransition } from "./transition.validate";
import { checkCrossLayerInvariants } from "./verify.invariants";
import { verifyCommercialSnapshots } from "./verify.snapshots";
import type { CommercialVerificationReport, LayerValidationSummary } from "./verify.types";
import { V64_VERIFY_LAYER_VERSION } from "./verify.types";
import { checkVersionConsistency } from "./verify.versions";

function collectLayerSummaries(input?: { deploymentId?: string }): LayerValidationSummary[] {
  const deploymentId = input?.deploymentId;

  const p1 = validateCommercialFoundation({ deploymentId });
  const p2 = validateCommercialPricing({ deploymentId });
  const p3 = validateCommercialFeatureMatrix({ deploymentId });
  const p4 = validateCommercialCapability({ deploymentId });
  const p5 = validateCommercialCatalog({ deploymentId });
  const p6 = validateCommercialTransition({ deploymentId });

  return [
    { layer: "P1", ok: p1.foundationOk, checks: p1 as unknown as Record<string, boolean> },
    { layer: "P2", ok: p2.pricingOk, checks: p2 as unknown as Record<string, boolean> },
    { layer: "P3", ok: p3.featureMatrixOk, checks: p3 as unknown as Record<string, boolean> },
    { layer: "P4", ok: p4.capabilityOk, checks: p4 as unknown as Record<string, boolean> },
    { layer: "P5", ok: p5.catalogOk, checks: p5 as unknown as Record<string, boolean> },
    { layer: "P6", ok: p6.transitionOk, checks: p6 as unknown as Record<string, boolean> },
  ];
}

export function buildCommercialVerificationReport(input?: {
  deploymentId?: string;
}): CommercialVerificationReport {
  const deploymentId = input?.deploymentId ?? "v64-verify-layer-default";
  const layers = collectLayerSummaries({ deploymentId });
  const versionConsistency = checkVersionConsistency({ deploymentId });
  const crossLayerInvariants = checkCrossLayerInvariants({ deploymentId });
  const snapshotVerification = verifyCommercialSnapshots({ deploymentId });

  const allLayersOk = layers.every((l) => l.ok);
  const backwardCompatible =
    versionConsistency.versionConsistencyOk && layers.find((l) => l.layer === "P1")?.ok === true;

  const verificationOk =
    allLayersOk &&
    versionConsistency.versionConsistencyOk &&
    crossLayerInvariants.crossLayerInvariantsOk &&
    snapshotVerification.snapshotVerificationOk &&
    backwardCompatible;

  return {
    version: V64_VERIFY_LAYER_VERSION,
    reportId: `commercial-verification-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    layers,
    versionConsistency,
    crossLayerInvariants,
    snapshotVerification,
    backwardCompatible,
    verificationOk,
    summary: [
      `commercial-verification ok=${verificationOk}`,
      `layers=${layers.filter((l) => l.ok).length}/${layers.length}`,
    ].join(" "),
  };
}
