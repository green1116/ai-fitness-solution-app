/**
 * V4-A1 Operational Stability
 */

import { isBuildFreezeIntact } from "../release/shared";
import {
  computeOperationsScore,
  operationsSummaryPrefix,
} from "./shared";
import { buildProductionOperationsRegistry, type ProductionOperationStatus } from "./registry";
import { getReleaseFoundationForOperations } from "./operations-context";

export const OPERATIONAL_STABILITY_VERSION = "4-a1-operational-stability-1" as const;

export type StabilityByStatus = Record<ProductionOperationStatus, number>;

export type OperationalStabilityReport = {
  version: typeof OPERATIONAL_STABILITY_VERSION;
  reportId: string;
  stabilityIndex: number;
  baselineAligned: boolean;
  freezeStable: boolean;
  integrityStable: boolean;
  activeOpsCount: number;
  frozenOpsCount: number;
  degradedOpsCount: number;
  statusDistribution: StabilityByStatus;
  summary: string;
};

function emptyStatusDistribution(): StabilityByStatus {
  return {
    planned: 0,
    active: 0,
    degraded: 0,
    maintenance: 0,
    stabilizing: 0,
    frozen: 0,
    retired: 0,
  };
}

export function buildOperationalStabilityReport(input?: {
  deploymentId?: string;
}): OperationalStabilityReport {
  const deploymentId = input?.deploymentId ?? "operational-stability";
  const reportId = `OST-V4A1-${deploymentId.slice(0, 8)}`;
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const release = getReleaseFoundationForOperations(deploymentId);

  const statusDistribution = emptyStatusDistribution();
  for (const record of registry.records) {
    statusDistribution[record.status] += 1;
  }

  const avgStability = Math.round(
    registry.records.reduce((sum, r) => sum + r.stabilityScore, 0) / registry.records.length,
  );

  const baselineAligned =
    release.baseline.baseline.readyForProduction && isBuildFreezeIntact();
  const freezeStable = release.freeze.integrityState === "sealed" && release.lock.locked;
  const integrityStable =
    release.integrity.baselineVerified && release.integrity.preservationVerified;

  const stabilityFlags = [baselineAligned, freezeStable, integrityStable, avgStability >= 80];
  const stabilityIndex = Math.round(
    (avgStability + computeOperationsScore(stabilityFlags)) / 2,
  );

  return {
    version: OPERATIONAL_STABILITY_VERSION,
    reportId,
    stabilityIndex,
    baselineAligned,
    freezeStable,
    integrityStable,
    activeOpsCount: registry.activeCount,
    frozenOpsCount: registry.frozenCount,
    degradedOpsCount: statusDistribution.degraded,
    statusDistribution,
    summary: `${operationsSummaryPrefix(deploymentId)} stability-index=${stabilityIndex} active=${registry.activeCount} frozen=${registry.frozenCount} degraded=${statusDistribution.degraded}`,
  };
}
