/**
 * RSO-3 — Incident Management Foundation
 * Deterministic incident projection from RSO-2 ApplicationMonitoring.
 * Baseline: rso2-application-monitoring-v1 (traces post-ga-production-baseline-v1).
 * No recovery / external alerting / prisma / redesign.
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
  APPLICATION_MONITORING_VERSION,
  RSO_2_ID,
  RSO1_RUNTIME_HEALTH_BASELINE,
  buildApplicationMonitoring,
  getApplicationMonitoring,
  type ApplicationMonitoring,
  type ApplicationMonitoringStatus,
  type MonitoringSignal,
} from "../monitoring";
import {
  aggregateIncidentSurfaceStatus,
  incidentSeverityFromSignalLevel,
  incidentStateFromSeverity,
  type IncidentSeverity,
  type IncidentState,
  type IncidentSurfaceStatus,
} from "./incident-severity";

export const RSO_3_ID = "RSO-3" as const;
export const RUNTIME_INCIDENT_CAPABILITY = "RuntimeIncident" as const;
export const RUNTIME_INCIDENT_VERSION =
  "rso-3-incident-management-1" as const;
/** RSO-2 application monitoring pack baseline. */
export const RSO2_APPLICATION_MONITORING_BASELINE =
  "rso2-application-monitoring-v1" as const;

export type RuntimeIncident = Readonly<{
  incidentId: string;
  sourceSignalId: string;
  sourceCheckId: string;
  severity: IncidentSeverity;
  state: IncidentState;
  summary: string;
  detail: string;
  ordinal: number;
}>;

export type RuntimeIncidents = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_3_ID;
  capability: typeof RUNTIME_INCIDENT_CAPABILITY;
  version: typeof RUNTIME_INCIDENT_VERSION;
  baselineTag: typeof RSO2_APPLICATION_MONITORING_BASELINE;
  parentPack: typeof RSO_2_ID;
  parentVersion: typeof APPLICATION_MONITORING_VERSION;
  parentBaseline: typeof RSO1_RUNTIME_HEALTH_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: IncidentSurfaceStatus;
  monitoringStatus: ApplicationMonitoringStatus;
  incidents: readonly RuntimeIncident[];
  incidentCount: number;
  openCount: number;
  observedCount: number;
  noneCount: number;
  mediumCount: number;
  criticalCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  applicationMonitoringFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noRecovery: true;
    noExternalAlerting: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: RuntimeIncidents | null = null;

function cloneIncidents(row: RuntimeIncidents): RuntimeIncidents {
  return {
    ...row,
    incidents: row.incidents.map((i) => ({ ...i })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RuntimeIncidents, "fingerprint">): string {
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
    monitoringStatus: row.monitoringStatus,
    incidents: row.incidents,
    incidentCount: row.incidentCount,
    openCount: row.openCount,
    observedCount: row.observedCount,
    noneCount: row.noneCount,
    mediumCount: row.mediumCount,
    criticalCount: row.criticalCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    applicationMonitoringFingerprint: row.applicationMonitoringFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RuntimeIncidents, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectIncident(
  signal: MonitoringSignal,
  ordinal: number,
): RuntimeIncident {
  const severity = incidentSeverityFromSignalLevel(signal.level);
  return {
    incidentId: `rso3-incident-${signal.sourceCheckId.toLowerCase()}`,
    sourceSignalId: signal.signalId,
    sourceCheckId: signal.sourceCheckId,
    severity,
    state: incidentStateFromSeverity(severity),
    summary: signal.summary,
    detail: signal.detail,
    ordinal,
  };
}

function deriveFromMonitoring(
  monitoring: ApplicationMonitoring,
): RuntimeIncidents {
  const incidents = monitoring.signals.map((signal, index) =>
    projectIncident(signal, index + 1),
  );
  const noneCount = incidents.filter((i) => i.severity === "NONE").length;
  const mediumCount = incidents.filter((i) => i.severity === "MEDIUM").length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "CRITICAL",
  ).length;
  const openCount = incidents.filter((i) => i.state === "OPEN").length;
  const observedCount = incidents.filter((i) => i.state === "OBSERVED").length;
  const status = aggregateIncidentSurfaceStatus(
    incidents.map((i) => i.severity),
  );

  const withoutFp: Omit<RuntimeIncidents, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_3_ID,
    capability: RUNTIME_INCIDENT_CAPABILITY,
    version: RUNTIME_INCIDENT_VERSION,
    baselineTag: RSO2_APPLICATION_MONITORING_BASELINE,
    parentPack: RSO_2_ID,
    parentVersion: APPLICATION_MONITORING_VERSION,
    parentBaseline: RSO1_RUNTIME_HEALTH_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    monitoringStatus: monitoring.status,
    incidents,
    incidentCount: incidents.length,
    openCount,
    observedCount,
    noneCount,
    mediumCount,
    criticalCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    applicationMonitoringFingerprint: monitoring.fingerprint,
    scope: {
      readOnly: true,
      noRecovery: true,
      noExternalAlerting: true,
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

/** Build RuntimeIncidents projection from RSO-2 ApplicationMonitoring. */
export function buildRuntimeIncidents(): RuntimeIncidents {
  const monitoring = getApplicationMonitoring();
  const out = deriveFromMonitoring(monitoring);
  cached = cloneIncidents(out);
  return cloneIncidents(cached);
}

/** Get last built RuntimeIncidents, or build if none cached. */
export function getRuntimeIncidents(): RuntimeIncidents {
  if (!cached) {
    return buildRuntimeIncidents();
  }
  return cloneIncidents(cached);
}

/** Stable content fingerprint for determinism checks. */
export function runtimeIncidentsFingerprint(row?: RuntimeIncidents): string {
  const v = row ?? getRuntimeIncidents();
  return v.fingerprint;
}

/** Test helper — clears RSO-3 cache only. */
export function clearRuntimeIncidents(): void {
  cached = null;
}

/** Ensure RSO-2 then build RSO-3 (verify scripts). */
export function ensureMonitoringThenBuildRuntimeIncidents(): RuntimeIncidents {
  buildApplicationMonitoring();
  clearRuntimeIncidents();
  return buildRuntimeIncidents();
}

export type { IncidentSeverity, IncidentState, IncidentSurfaceStatus };
