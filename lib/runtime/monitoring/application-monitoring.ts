/**
 * RSO-2 — Application Monitoring Layer
 * Deterministic monitoring projection from RSO-1 RuntimeHealth.
 * Baseline: rso1-runtime-health-v1 (traces post-ga-production-baseline-v1).
 * No live monitoring / incident / recovery / prisma / redesign.
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
  RSO_1_ID,
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealth,
  getRuntimeHealth,
  type HealthCheck,
  type RuntimeHealth,
  type RuntimeHealthStatus,
} from "../health";
import {
  aggregateMonitoringStatus,
  monitoringLevelFromHealthStatus,
  type ApplicationMonitoringStatus,
  type MonitoringSignal,
} from "./monitoring-signal";

export const RSO_2_ID = "RSO-2" as const;
export const APPLICATION_MONITORING_CAPABILITY =
  "ApplicationMonitoring" as const;
export const APPLICATION_MONITORING_VERSION =
  "rso-2-application-monitoring-1" as const;
/** RSO-1 runtime health pack baseline. */
export const RSO1_RUNTIME_HEALTH_BASELINE = "rso1-runtime-health-v1" as const;

export type ApplicationMonitoring = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_2_ID;
  capability: typeof APPLICATION_MONITORING_CAPABILITY;
  version: typeof APPLICATION_MONITORING_VERSION;
  baselineTag: typeof RSO1_RUNTIME_HEALTH_BASELINE;
  parentPack: typeof RSO_1_ID;
  parentVersion: typeof RUNTIME_HEALTH_VERSION;
  parentBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: ApplicationMonitoringStatus;
  healthStatus: RuntimeHealthStatus;
  signals: readonly MonitoringSignal[];
  signalCount: number;
  infoCount: number;
  warnCount: number;
  criticalCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  runtimeHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveMonitoring: true;
    noIncident: true;
    noRecovery: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationMonitoring | null = null;

function cloneMonitoring(row: ApplicationMonitoring): ApplicationMonitoring {
  return {
    ...row,
    signals: row.signals.map((s) => ({ ...s })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationMonitoring, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    status: row.status,
    healthStatus: row.healthStatus,
    signals: row.signals,
    signalCount: row.signalCount,
    infoCount: row.infoCount,
    warnCount: row.warnCount,
    criticalCount: row.criticalCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    runtimeHealthFingerprint: row.runtimeHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationMonitoring, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectSignal(check: HealthCheck, ordinal: number): MonitoringSignal {
  const level = monitoringLevelFromHealthStatus(check.status);
  return {
    signalId: `rso2-signal-${check.id.toLowerCase()}`,
    sourceCheckId: check.id,
    level,
    summary: check.name,
    detail: check.detail,
    ordinal,
  };
}

function deriveFromHealth(health: RuntimeHealth): ApplicationMonitoring {
  const signals = health.checks.map((check, index) =>
    projectSignal(check, index + 1),
  );
  const infoCount = signals.filter((s) => s.level === "INFO").length;
  const warnCount = signals.filter((s) => s.level === "WARN").length;
  const criticalCount = signals.filter((s) => s.level === "CRITICAL").length;
  const status = aggregateMonitoringStatus(signals.map((s) => s.level));

  const withoutFp: Omit<ApplicationMonitoring, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_2_ID,
    capability: APPLICATION_MONITORING_CAPABILITY,
    version: APPLICATION_MONITORING_VERSION,
    baselineTag: RSO1_RUNTIME_HEALTH_BASELINE,
    parentPack: RSO_1_ID,
    parentVersion: RUNTIME_HEALTH_VERSION,
    parentBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    healthStatus: health.status,
    signals,
    signalCount: signals.length,
    infoCount,
    warnCount,
    criticalCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    runtimeHealthFingerprint: health.fingerprint,
    scope: {
      readOnly: true,
      noLiveMonitoring: true,
      noIncident: true,
      noRecovery: true,
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

/** Build ApplicationMonitoring projection from RSO-1 RuntimeHealth. */
export function buildApplicationMonitoring(): ApplicationMonitoring {
  const health = getRuntimeHealth();
  const out = deriveFromHealth(health);
  cached = cloneMonitoring(out);
  return cloneMonitoring(cached);
}

/** Get last built ApplicationMonitoring, or build if none cached. */
export function getApplicationMonitoring(): ApplicationMonitoring {
  if (!cached) {
    return buildApplicationMonitoring();
  }
  return cloneMonitoring(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationMonitoringFingerprint(
  row?: ApplicationMonitoring,
): string {
  const v = row ?? getApplicationMonitoring();
  return v.fingerprint;
}

/** Test helper — clears RSO-2 cache only. */
export function clearApplicationMonitoring(): void {
  cached = null;
}

/** Ensure RSO-1 then build RSO-2 (verify scripts). */
export function ensureHealthThenBuildApplicationMonitoring(): ApplicationMonitoring {
  buildRuntimeHealth();
  clearApplicationMonitoring();
  return buildApplicationMonitoring();
}

export type { ApplicationMonitoringStatus, MonitoringSignal };
