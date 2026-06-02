/**
 * V3.7 FINAL —integrity restore verification
 */

import { V37_RESTORATION_WINDOW } from "../shared";
import { buildIntegrityVerification } from "./integrity-verification";
import { buildIntegritySeal } from "./integrity-seal";

export const INTEGRITY_RESTORE_VERSION = "3.7-final-integrity-restore-1" as const;

export type IntegrityRestoreVerification = {
  version: typeof INTEGRITY_RESTORE_VERSION;
  restoreId: string;
  restorationWindow: typeof V37_RESTORATION_WINDOW;
  restoreReady: boolean;
  rollbackReady: boolean;
  sealValid: boolean;
  summary: string;
};

export function buildIntegrityRestoreVerification(input?: { deploymentId?: string }): IntegrityRestoreVerification {
  const deploymentId = input?.deploymentId ?? "integrity-restore";
  const restoreId = `IRV-V37FINAL-${deploymentId.slice(0, 8)}`;
  const verification = buildIntegrityVerification({ deploymentId });
  const seal = buildIntegritySeal({ deploymentId });

  const restoreReady =
    verification.baselineVerified &&
    verification.preservationVerified &&
    seal.freezeSeal;
  const rollbackReady = verification.archivalContinuityVerified && verification.releaseVerified;

  return {
    version: INTEGRITY_RESTORE_VERSION,
    restoreId,
    restorationWindow: V37_RESTORATION_WINDOW,
    restoreReady,
    rollbackReady,
    sealValid: seal.freezeSeal,
    summary: `integrity-restore id=${restoreId} restore=${restoreReady} rollback=${rollbackReady} window=${V37_RESTORATION_WINDOW}`,
  };
}
