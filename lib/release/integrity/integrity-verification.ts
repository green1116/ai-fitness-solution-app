/**
 * V3.7 FINAL —integrity verification
 */

import { getEnterpriseStackSnapshot } from "../release-context";
import { baselineHashFromLayers, isBuildFreezeIntact } from "../shared";
import { buildFreezeBaseline } from "../freeze/freeze-baseline";

export const INTEGRITY_VERIFICATION_VERSION = "3.7-final-integrity-verification-1" as const;

export type IntegrityVerification = {
  version: typeof INTEGRITY_VERIFICATION_VERSION;
  verificationId: string;
  baselineVerified: boolean;
  releaseVerified: boolean;
  compatibilityVerified: boolean;
  preservationVerified: boolean;
  archivalContinuityVerified: boolean;
  baselineHash: string;
  summary: string;
};

export function buildIntegrityVerification(input?: { deploymentId?: string }): IntegrityVerification {
  const deploymentId = input?.deploymentId ?? "integrity-verification";
  const verificationId = `IVF-V37FINAL-${deploymentId.slice(0, 8)}`;
  const stack = getEnterpriseStackSnapshot(deploymentId);
  const baseline = buildFreezeBaseline({ deploymentId });

  const baselineVerified = baseline.intact && isBuildFreezeIntact();
  const releaseVerified = stack.manifest.readyForPreservationClosure;
  const compatibilityVerified = stack.manifest.readyForLifecycleClosure;
  const preservationVerified = stack.summary.preservationReady;
  const archivalContinuityVerified = stack.summary.archivalClosureReady;

  return {
    version: INTEGRITY_VERIFICATION_VERSION,
    verificationId,
    baselineVerified,
    releaseVerified,
    compatibilityVerified,
    preservationVerified,
    archivalContinuityVerified,
    baselineHash: baselineHashFromLayers(),
    summary: `integrity-verification id=${verificationId} baseline=${baselineVerified} release=${releaseVerified} preservation=${preservationVerified} archival=${archivalContinuityVerified}`,
  };
}
