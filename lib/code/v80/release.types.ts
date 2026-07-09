/**
 * V80 CODE P4 — Release layer types
 */
export const V80_CODE_RELEASE_VERSION = "v80-code-release-1" as const;
export const V80_CODE_RELEASE_FREEZE_VERSION = "v80-code-release-freeze-1" as const;

export type ReleaseOpsModule = {
  id: string;
  path: string;
  kind: "deployment" | "observability" | "governance" | "commercial";
  productionRef: string;
};

export type ReleaseManifest = {
  version: typeof V80_CODE_RELEASE_VERSION;
  hardenedVersion: string;
  deploymentBindings: number;
  observabilityHooks: number;
  governanceHooks: number;
  commercialGates: number;
  releaseComplete: boolean;
  summary: string;
};

export type ReleaseReport = {
  version: typeof V80_CODE_RELEASE_VERSION;
  freezeVersion: typeof V80_CODE_RELEASE_FREEZE_VERSION;
  reportId: string;
  hardenedReady: boolean;
  productionReady: boolean;
  manifest: ReleaseManifest;
  modules: ReleaseOpsModule[];
  releaseReady: boolean;
  readinessScore: number;
  summary: string;
};
