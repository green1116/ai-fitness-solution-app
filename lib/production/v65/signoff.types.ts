/**
 * V65 P8 — Production sign-off types
 */
import type { ProductionFreezeManifest } from "./freeze.types";

export const V65_PRODUCTION_SIGNOFF_VERSION = "v65-production-signoff-1" as const;

export type ProductionSignoffPhase = {
  id: string;
  label: string;
  ok: boolean;
};

export type ProductionSignoffReport = {
  version: typeof V65_PRODUCTION_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: ProductionSignoffPhase[];
  freeze: ProductionFreezeManifest;
  allPhasesPass: boolean;
  signedOff: boolean;
  closingSummary: string;
  summary: string;
};
