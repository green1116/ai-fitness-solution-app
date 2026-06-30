/**
 * V64 P7 — Snapshot verification across commercial layers
 */
import { validateCommercialCapabilitySnapshot } from "./capability.validate";
import { buildCommercialCapabilitySnapshot } from "./capability.snapshot";
import { validateTierCatalogSnapshot } from "./catalog.validate";
import { buildTierCatalogSnapshot } from "./catalog.snapshot";
import { validateCommercialFeatureMatrixSnapshot } from "./feature.validate";
import { buildCommercialFeatureMatrixSnapshot } from "./feature.snapshot";
import { validateCommercialPricingSnapshot } from "./pricing.validate";
import { buildCommercialPricingSnapshot } from "./pricing.snapshot";
import { validateCommercialTransitionSnapshot } from "./transition.validate";
import { buildCommercialTransitionSnapshot } from "./transition.snapshot";
import type { SnapshotVerificationReport } from "./verify.types";

export function verifyCommercialSnapshots(input?: {
  deploymentId?: string;
}): SnapshotVerificationReport {
  const deploymentId = input?.deploymentId ?? "v64-verify-layer-default";

  const pricingSnapshot = buildCommercialPricingSnapshot({ deploymentId });
  const featureSnapshot = buildCommercialFeatureMatrixSnapshot({ deploymentId });
  const capabilitySnapshot = buildCommercialCapabilitySnapshot({ deploymentId });
  const catalogSnapshot = buildTierCatalogSnapshot({ deploymentId });
  const transitionSnapshot = buildCommercialTransitionSnapshot({ deploymentId });

  const pricingSnapshotOk = validateCommercialPricingSnapshot(pricingSnapshot).pricingOk;
  const featureSnapshotOk =
    validateCommercialFeatureMatrixSnapshot(featureSnapshot).featureMatrixOk;
  const capabilitySnapshotOk =
    validateCommercialCapabilitySnapshot(capabilitySnapshot).capabilityOk;
  const catalogSnapshotOk = validateTierCatalogSnapshot(catalogSnapshot).catalogOk;
  const transitionSnapshotOk =
    validateCommercialTransitionSnapshot(transitionSnapshot).transitionOk;

  const snapshotVerificationOk =
    pricingSnapshotOk &&
    featureSnapshotOk &&
    capabilitySnapshotOk &&
    catalogSnapshotOk &&
    transitionSnapshotOk;

  return {
    pricingSnapshotOk,
    featureSnapshotOk,
    capabilitySnapshotOk,
    catalogSnapshotOk,
    transitionSnapshotOk,
    snapshotVerificationOk,
  };
}
