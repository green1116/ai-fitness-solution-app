/**
 * V3.7 FINAL —integrity seal
 */

import { baselineHashFromLayers } from "../shared";
import { buildProductionFreezeManifest } from "../freeze/freeze-manifest";
import { buildFreezeIntegrityReport } from "../freeze/freeze-integrity";

export const INTEGRITY_SEAL_VERSION = "3.7-final-integrity-seal-1" as const;

export type IntegritySeal = {
  version: typeof INTEGRITY_SEAL_VERSION;
  sealId: string;
  freezeSeal: boolean;
  baselineHash: string;
  sealedAt: string;
  summary: string;
};

export function buildIntegritySeal(input?: { deploymentId?: string }): IntegritySeal {
  const deploymentId = input?.deploymentId ?? "integrity-seal";
  const sealId = `ISL-V37FINAL-${deploymentId.slice(0, 8)}`;
  const manifest = buildProductionFreezeManifest({ deploymentId });
  const integrity = buildFreezeIntegrityReport({ deploymentId });

  return {
    version: INTEGRITY_SEAL_VERSION,
    sealId,
    freezeSeal: manifest.integrityState === "sealed" && integrity.intact,
    baselineHash: baselineHashFromLayers(),
    sealedAt: manifest.baselineTimestamp,
    summary: `integrity-seal id=${sealId} freezeSeal=${manifest.integrityState === "sealed"} hash=${baselineHashFromLayers()}`,
  };
}
