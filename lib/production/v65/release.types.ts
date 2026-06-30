/**
 * V65 P6 — Release-ready gate types
 */
import type { ProductionReadinessReport } from "./audit.types";
import type { RuntimeRiskReport } from "./runtime.types";

export const V65_RELEASE_READY_VERSION = "v65-release-ready-1" as const;

export type ReleaseGateSignals = {
  verifyChainPass?: boolean;
  typeScriptClean?: boolean;
  buildPass?: boolean;
  prismaPreflightPass?: boolean;
};

export type ReleaseReadyManifest = {
  version: typeof V65_RELEASE_READY_VERSION;
  manifestId: string;
  releasedAt: string;
  deploymentId: string;
  commercialFrozen: boolean;
  runtimeRiskOk: boolean;
  prismaPreflightPass: boolean;
  typeScriptClean: boolean;
  buildPass: boolean;
  verifyChainPass: boolean;
  openBlockerCount: number;
  readinessScore: number;
  productionReadiness: ProductionReadinessReport;
  runtimeRisk: RuntimeRiskReport;
  releaseReady: boolean;
  summary: string;
};
