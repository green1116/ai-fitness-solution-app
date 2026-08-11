/**
 * RSO-1 — Runtime Health Foundation
 * Deterministic RuntimeHealth contract (no live probes).
 * Baseline: post-ga-production-baseline-v1.
 * No prisma / model / architecture redesign.
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
  HEALTH_CHECK_IDS,
  aggregateRuntimeHealthStatus,
  healthStatusFromResult,
  type HealthCheckId,
  type HealthCheckResult,
  type RuntimeHealthStatus,
} from "./health-status";

export const RSO_1_ID = "RSO-1" as const;
export const RUNTIME_HEALTH_CAPABILITY = "RuntimeHealth" as const;
export const RUNTIME_HEALTH_VERSION = "rso-1-runtime-health-1" as const;

export type HealthCheck = Readonly<{
  id: HealthCheckId;
  name: string;
  result: HealthCheckResult;
  status: RuntimeHealthStatus;
  detail: string;
}>;

export type RuntimeHealth = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_1_ID;
  capability: typeof RUNTIME_HEALTH_CAPABILITY;
  version: typeof RUNTIME_HEALTH_VERSION;
  baselineTag: typeof POST_GA_PRODUCTION_BASELINE;
  status: RuntimeHealthStatus;
  checks: readonly HealthCheck[];
  passedCount: number;
  failedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveProbes: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: RuntimeHealth | null = null;

function cloneHealth(row: RuntimeHealth): RuntimeHealth {
  return {
    ...row,
    checks: row.checks.map((c) => ({ ...c })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RuntimeHealth, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    status: row.status,
    checks: row.checks,
    passedCount: row.passedCount,
    failedCount: row.failedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<RuntimeHealth, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function buildChecks(): HealthCheck[] {
  const defs: ReadonlyArray<{
    id: HealthCheckId;
    name: string;
    result: HealthCheckResult;
    detail: string;
  }> = [
    {
      id: "BASELINE_BOUND",
      name: "Post-GA production baseline bound",
      result:
        POST_GA_PRODUCTION_BASELINE === "post-ga-production-baseline-v1"
          ? "PASS"
          : "FAIL",
      detail: `baseline=${POST_GA_PRODUCTION_BASELINE}`,
    },
    {
      id: "GA_BASELINE_LOCK",
      name: "GA baseline lock intact",
      result: GA_RELEASE_BASELINE.length > 0 ? "PASS" : "FAIL",
      detail: `gaBaseline=${GA_RELEASE_BASELINE}`,
    },
    {
      id: "SURFACE_DECLARED",
      name: "Health check surface declared",
      result: HEALTH_CHECK_IDS.length === 4 ? "PASS" : "FAIL",
      detail: `checks=${HEALTH_CHECK_IDS.length}`,
    },
    {
      id: "NO_LIVE_PROBES",
      name: "No live runtime probes",
      result: "PASS",
      detail: "contract-only",
    },
  ];

  return defs.map((d) => ({
    id: d.id,
    name: d.name,
    result: d.result,
    status: healthStatusFromResult(d.result),
    detail: d.detail,
  }));
}

function deriveRuntimeHealth(): RuntimeHealth {
  const checks = buildChecks();
  const passedCount = checks.filter((c) => c.result === "PASS").length;
  const failedCount = checks.filter((c) => c.result === "FAIL").length;
  const status = aggregateRuntimeHealthStatus(checks.map((c) => c.result));

  const withoutFp: Omit<RuntimeHealth, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_1_ID,
    capability: RUNTIME_HEALTH_CAPABILITY,
    version: RUNTIME_HEALTH_VERSION,
    baselineTag: POST_GA_PRODUCTION_BASELINE,
    status,
    checks,
    passedCount,
    failedCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    scope: {
      readOnly: true,
      noLiveProbes: true,
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

/** Build deterministic RuntimeHealth contract. */
export function buildRuntimeHealth(): RuntimeHealth {
  const out = deriveRuntimeHealth();
  cached = cloneHealth(out);
  return cloneHealth(cached);
}

/** Get last built RuntimeHealth, or build if none cached. */
export function getRuntimeHealth(): RuntimeHealth {
  if (!cached) {
    return buildRuntimeHealth();
  }
  return cloneHealth(cached);
}

/** Stable content fingerprint for determinism checks. */
export function runtimeHealthFingerprint(row?: RuntimeHealth): string {
  const v = row ?? getRuntimeHealth();
  return v.fingerprint;
}

/** Test helper — clears RSO-1 cache only. */
export function clearRuntimeHealth(): void {
  cached = null;
}
