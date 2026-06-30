/**
 * V64 P8 — Commercial freeze layer types
 */
import type { CommercialVerificationReport } from "./verify.types";

export const V64_COMMERCIAL_FREEZE_VERSION = "v64-commercial-freeze-1" as const;

export type CommercialLayerVersionLock = {
  foundation: string;
  pricing: string;
  featureMatrix: string;
  capability: string;
  catalog: string;
  transition: string;
  verify: string;
  freeze: typeof V64_COMMERCIAL_FREEZE_VERSION;
  packaging: string;
};

export type CommercialFreezeManifest = {
  version: typeof V64_COMMERCIAL_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: CommercialLayerVersionLock;
  versionLockOk: boolean;
  verification: CommercialVerificationReport;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};
