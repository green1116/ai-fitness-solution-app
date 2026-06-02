/**
 * V3.7 FINAL —freeze integrity state
 */

import { BUILD_FREEZE_MANIFEST } from "../../commercialization/stabilization/build-freeze";
import { getEnterpriseStackSnapshot } from "../release-context";
import { isBuildFreezeIntact } from "../shared";

export const FREEZE_INTEGRITY_VERSION = "3.7-final-freeze-integrity-1" as const;

export type FreezeIntegrityReport = {
  version: typeof FREEZE_INTEGRITY_VERSION;
  reportId: string;
  buildPassed: boolean;
  tscPassed: boolean;
  runtimeVerified: boolean;
  evidenceVerified: boolean;
  executiveVerified: boolean;
  preservationContinuity: boolean;
  lifecycleContinuity: boolean;
  intact: boolean;
  summary: string;
};

export function buildFreezeIntegrityReport(input?: { deploymentId?: string }): FreezeIntegrityReport {
  const deploymentId = input?.deploymentId ?? "freeze-integrity";
  const reportId = `FIR-V37FINAL-${deploymentId.slice(0, 8)}`;
  const stack = getEnterpriseStackSnapshot(deploymentId);
  const m = BUILD_FREEZE_MANIFEST;

  const preservationContinuity = stack.manifest.readyForEnterprise && stack.summary.confidenceScore >= 80;
  const lifecycleContinuity = stack.summary.lifecycleClosureReady;
  const intact = isBuildFreezeIntact() && preservationContinuity && lifecycleContinuity;

  return {
    version: FREEZE_INTEGRITY_VERSION,
    reportId,
    buildPassed: m.buildPassed,
    tscPassed: m.tscPassed,
    runtimeVerified: m.runtimeVerified,
    evidenceVerified: m.evidenceVerified,
    executiveVerified: m.executiveVerified,
    preservationContinuity,
    lifecycleContinuity,
    intact,
    summary: `freeze-integrity id=${reportId} intact=${intact} preservation=${preservationContinuity} lifecycle=${lifecycleContinuity}`,
  };
}
