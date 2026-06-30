/**
 * V64 P7 — Commercial verification layer types
 */
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const V64_VERIFY_LAYER_VERSION = "v64-verify-layer-1" as const;

export type CommercialLayerId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type LayerValidationSummary = {
  layer: CommercialLayerId;
  ok: boolean;
  checks: Record<string, boolean>;
};

export type VersionConsistencyReport = {
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  layerVersions: Record<string, string>;
  allSnapshotsReferenceFoundation: boolean;
  packagingVersionPresent: boolean;
  versionConsistencyOk: boolean;
};

export type CrossLayerInvariantReport = {
  tierCountConsistent: boolean;
  productNameConsistent: boolean;
  saasPlanMappingConsistent: boolean;
  transitionPathsConsistent: boolean;
  crossLayerInvariantsOk: boolean;
};

export type SnapshotVerificationReport = {
  pricingSnapshotOk: boolean;
  featureSnapshotOk: boolean;
  capabilitySnapshotOk: boolean;
  catalogSnapshotOk: boolean;
  transitionSnapshotOk: boolean;
  snapshotVerificationOk: boolean;
};

export type CommercialVerificationReport = {
  version: typeof V64_VERIFY_LAYER_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  layers: LayerValidationSummary[];
  versionConsistency: VersionConsistencyReport;
  crossLayerInvariants: CrossLayerInvariantReport;
  snapshotVerification: SnapshotVerificationReport;
  backwardCompatible: boolean;
  verificationOk: boolean;
  summary: string;
};
