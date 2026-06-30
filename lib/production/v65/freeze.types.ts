/**
 * V65 P7 — Production freeze types
 */
import type { ReleaseReadyManifest } from "./release.types";

export const V65_PRODUCTION_FREEZE_VERSION = "v65-production-freeze-1" as const;

export type ProductionLayerVersionLock = {
  audit: string;
  runtimeRisk: string;
  releaseReady: string;
  freeze: typeof V65_PRODUCTION_FREEZE_VERSION;
  commercialFreeze: string;
};

export type ProductionArtifactSurface = {
  libEntry: string;
  freezeDoc: string;
  auditDoc: string;
  runtimeDoc: string;
  releaseDoc: string;
  verifyProduction: string;
  verifyFreeze: string;
};

export type ProductionFreezeManifest = {
  version: typeof V65_PRODUCTION_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: ProductionLayerVersionLock;
  versionLockOk: boolean;
  releaseReady: ReleaseReadyManifest;
  artifactSurface: ProductionArtifactSurface;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};
