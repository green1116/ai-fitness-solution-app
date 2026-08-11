/**
 * RSO-6 — Service Reliability Metrics
 * Deterministic reliability projection from RSO-5 TenantOperations.
 * Baseline: rso5-tenant-operations-v1 (traces post-ga-production-baseline-v1).
 * No external APM / SLA / billing / prisma / Project·Quote·Tender / redesign.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";
import { RELEASE_ID } from "../../release/release-readiness";
import {
  RSO4_RECOVERY_WORKFLOW_BASELINE,
  RSO_5_ID,
  TENANT_OPERATIONS_VERSION,
  buildTenantOperations,
  getTenantOperations,
  type TenantOperation,
  type TenantOperations,
  type TenantOperationsSurfaceStatus,
} from "../tenant";
import {
  aggregateServiceReliabilityStatus,
  reliabilityGradeFromTenantStatus,
  reliabilityScoreFromGrade,
  type ReliabilityGrade,
  type ReliabilityMetric,
  type ServiceReliabilityStatus,
} from "./reliability-metric";

export const RSO_6_ID = "RSO-6" as const;
export const SERVICE_RELIABILITY_CAPABILITY = "ServiceReliability" as const;
export const SERVICE_RELIABILITY_VERSION =
  "rso-6-service-reliability-1" as const;
/** RSO-5 tenant operations pack baseline. */
export const RSO5_TENANT_OPERATIONS_BASELINE =
  "rso5-tenant-operations-v1" as const;

export type ServiceReliability = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_6_ID;
  capability: typeof SERVICE_RELIABILITY_CAPABILITY;
  version: typeof SERVICE_RELIABILITY_VERSION;
  baselineTag: typeof RSO5_TENANT_OPERATIONS_BASELINE;
  parentPack: typeof RSO_5_ID;
  parentVersion: typeof TENANT_OPERATIONS_VERSION;
  parentBaseline: typeof RSO4_RECOVERY_WORKFLOW_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: ServiceReliabilityStatus;
  tenantOperationsStatus: TenantOperationsSurfaceStatus;
  metrics: readonly ReliabilityMetric[];
  metricCount: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  poorCount: number;
  averageScore: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  tenantOperationsFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noExternalMonitoring: true;
    noApm: true;
    noSla: true;
    noBilling: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ServiceReliability | null = null;

function cloneReliability(row: ServiceReliability): ServiceReliability {
  return {
    ...row,
    metrics: row.metrics.map((m) => ({ ...m })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ServiceReliability, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    status: row.status,
    tenantOperationsStatus: row.tenantOperationsStatus,
    metrics: row.metrics,
    metricCount: row.metricCount,
    excellentCount: row.excellentCount,
    goodCount: row.goodCount,
    fairCount: row.fairCount,
    poorCount: row.poorCount,
    averageScore: row.averageScore,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    tenantOperationsFingerprint: row.tenantOperationsFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ServiceReliability, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectMetric(
  operation: TenantOperation,
  ordinal: number,
): ReliabilityMetric {
  const grade = reliabilityGradeFromTenantStatus(operation.status);
  return {
    metricId: `rso6-metric-${operation.sourceCheckId.toLowerCase()}`,
    tenantId: operation.tenantId,
    sourceOperationId: operation.operationId,
    sourceCheckId: operation.sourceCheckId,
    grade,
    score: reliabilityScoreFromGrade(grade),
    summary: operation.summary,
    detail: operation.detail,
    ordinal,
  };
}

function averageScore(metrics: readonly ReliabilityMetric[]): number {
  if (metrics.length === 0) return 0;
  const sum = metrics.reduce((acc, m) => acc + m.score, 0);
  return Math.round((sum / metrics.length) * 100) / 100;
}

function deriveFromTenantOps(
  tenantOps: TenantOperations,
): ServiceReliability {
  const metrics = tenantOps.operations.map((operation, index) =>
    projectMetric(operation, index + 1),
  );
  const excellentCount = metrics.filter((m) => m.grade === "EXCELLENT").length;
  const goodCount = metrics.filter((m) => m.grade === "GOOD").length;
  const fairCount = metrics.filter((m) => m.grade === "FAIR").length;
  const poorCount = metrics.filter((m) => m.grade === "POOR").length;
  const status = aggregateServiceReliabilityStatus(
    metrics.map((m) => m.grade),
  );

  const withoutFp: Omit<ServiceReliability, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_6_ID,
    capability: SERVICE_RELIABILITY_CAPABILITY,
    version: SERVICE_RELIABILITY_VERSION,
    baselineTag: RSO5_TENANT_OPERATIONS_BASELINE,
    parentPack: RSO_5_ID,
    parentVersion: TENANT_OPERATIONS_VERSION,
    parentBaseline: RSO4_RECOVERY_WORKFLOW_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    tenantOperationsStatus: tenantOps.status,
    metrics,
    metricCount: metrics.length,
    excellentCount,
    goodCount,
    fairCount,
    poorCount,
    averageScore: averageScore(metrics),
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    tenantOperationsFingerprint: tenantOps.fingerprint,
    scope: {
      readOnly: true,
      noExternalMonitoring: true,
      noApm: true,
      noSla: true,
      noBilling: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build ServiceReliability projection from RSO-5 TenantOperations. */
export function buildServiceReliability(): ServiceReliability {
  const tenantOps = getTenantOperations();
  const out = deriveFromTenantOps(tenantOps);
  cached = cloneReliability(out);
  return cloneReliability(cached);
}

/** Get last built ServiceReliability, or build if none cached. */
export function getServiceReliability(): ServiceReliability {
  if (!cached) {
    return buildServiceReliability();
  }
  return cloneReliability(cached);
}

/** Stable content fingerprint for determinism checks. */
export function serviceReliabilityFingerprint(
  row?: ServiceReliability,
): string {
  const v = row ?? getServiceReliability();
  return v.fingerprint;
}

/** Test helper — clears RSO-6 cache only. */
export function clearServiceReliability(): void {
  cached = null;
}

/** Ensure RSO-5 then build RSO-6 (verify scripts). */
export function ensureTenantOpsThenBuildServiceReliability(): ServiceReliability {
  buildTenantOperations();
  clearServiceReliability();
  return buildServiceReliability();
}

export type { ReliabilityGrade, ReliabilityMetric, ServiceReliabilityStatus };
