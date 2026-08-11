/**
 * RSO-4 — Recovery Workflow Foundation
 * Deterministic recovery projection from RSO-3 RuntimeIncidents.
 * Baseline: rso3-incident-management-v1 (traces post-ga-production-baseline-v1).
 * No deployment automation / external integration / prisma / redesign.
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
  RSO2_APPLICATION_MONITORING_BASELINE,
  RSO_3_ID,
  RUNTIME_INCIDENT_VERSION,
  buildRuntimeIncidents,
  getRuntimeIncidents,
  type IncidentSurfaceStatus,
  type RuntimeIncident,
  type RuntimeIncidents,
} from "../incident";
import {
  aggregateRecoveryWorkflowStatus,
  recoveryIntentFromStatus,
  recoveryStatusFromIncident,
  type RecoveryAction,
  type RecoveryStatus,
  type RecoveryWorkflowStatus,
} from "./recovery-status";

export const RSO_4_ID = "RSO-4" as const;
export const RECOVERY_WORKFLOW_CAPABILITY = "RecoveryWorkflow" as const;
export const RECOVERY_WORKFLOW_VERSION =
  "rso-4-recovery-workflow-1" as const;
/** RSO-3 incident management pack baseline. */
export const RSO3_INCIDENT_MANAGEMENT_BASELINE =
  "rso3-incident-management-v1" as const;

export type RecoveryWorkflow = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RSO_4_ID;
  capability: typeof RECOVERY_WORKFLOW_CAPABILITY;
  version: typeof RECOVERY_WORKFLOW_VERSION;
  baselineTag: typeof RSO3_INCIDENT_MANAGEMENT_BASELINE;
  parentPack: typeof RSO_3_ID;
  parentVersion: typeof RUNTIME_INCIDENT_VERSION;
  parentBaseline: typeof RSO2_APPLICATION_MONITORING_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  status: RecoveryWorkflowStatus;
  incidentSurfaceStatus: IncidentSurfaceStatus;
  actions: readonly RecoveryAction[];
  actionCount: number;
  idleCount: number;
  plannedCount: number;
  armedCount: number;
  heldCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  runtimeIncidentsFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDeploymentAutomation: true;
    noExternalIntegration: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: RecoveryWorkflow | null = null;

function cloneWorkflow(row: RecoveryWorkflow): RecoveryWorkflow {
  return {
    ...row,
    actions: row.actions.map((a) => ({ ...a })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<RecoveryWorkflow, "fingerprint">): string {
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
    incidentSurfaceStatus: row.incidentSurfaceStatus,
    actions: row.actions,
    actionCount: row.actionCount,
    idleCount: row.idleCount,
    plannedCount: row.plannedCount,
    armedCount: row.armedCount,
    heldCount: row.heldCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    runtimeIncidentsFingerprint: row.runtimeIncidentsFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RecoveryWorkflow, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function projectAction(
  incident: RuntimeIncident,
  ordinal: number,
): RecoveryAction {
  const status = recoveryStatusFromIncident({
    severity: incident.severity,
    state: incident.state,
  });
  return {
    actionId: `rso4-action-${incident.sourceCheckId.toLowerCase()}`,
    sourceIncidentId: incident.incidentId,
    sourceCheckId: incident.sourceCheckId,
    status,
    intent: recoveryIntentFromStatus(status),
    summary: incident.summary,
    detail: incident.detail,
    ordinal,
  };
}

function deriveFromIncidents(incidents: RuntimeIncidents): RecoveryWorkflow {
  const actions = incidents.incidents.map((incident, index) =>
    projectAction(incident, index + 1),
  );
  const idleCount = actions.filter((a) => a.status === "IDLE").length;
  const plannedCount = actions.filter((a) => a.status === "PLANNED").length;
  const armedCount = actions.filter((a) => a.status === "ARMED").length;
  const heldCount = actions.filter((a) => a.status === "HELD").length;
  const status = aggregateRecoveryWorkflowStatus(actions.map((a) => a.status));

  const withoutFp: Omit<RecoveryWorkflow, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: RSO_4_ID,
    capability: RECOVERY_WORKFLOW_CAPABILITY,
    version: RECOVERY_WORKFLOW_VERSION,
    baselineTag: RSO3_INCIDENT_MANAGEMENT_BASELINE,
    parentPack: RSO_3_ID,
    parentVersion: RUNTIME_INCIDENT_VERSION,
    parentBaseline: RSO2_APPLICATION_MONITORING_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    status,
    incidentSurfaceStatus: incidents.status,
    actions,
    actionCount: actions.length,
    idleCount,
    plannedCount,
    armedCount,
    heldCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    runtimeIncidentsFingerprint: incidents.fingerprint,
    scope: {
      readOnly: true,
      noDeploymentAutomation: true,
      noExternalIntegration: true,
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

/** Build RecoveryWorkflow projection from RSO-3 RuntimeIncidents. */
export function buildRecoveryWorkflow(): RecoveryWorkflow {
  const incidents = getRuntimeIncidents();
  const out = deriveFromIncidents(incidents);
  cached = cloneWorkflow(out);
  return cloneWorkflow(cached);
}

/** Get last built RecoveryWorkflow, or build if none cached. */
export function getRecoveryWorkflow(): RecoveryWorkflow {
  if (!cached) {
    return buildRecoveryWorkflow();
  }
  return cloneWorkflow(cached);
}

/** Stable content fingerprint for determinism checks. */
export function recoveryWorkflowFingerprint(row?: RecoveryWorkflow): string {
  const v = row ?? getRecoveryWorkflow();
  return v.fingerprint;
}

/** Test helper — clears RSO-4 cache only. */
export function clearRecoveryWorkflow(): void {
  cached = null;
}

/** Ensure RSO-3 then build RSO-4 (verify scripts). */
export function ensureIncidentsThenBuildRecoveryWorkflow(): RecoveryWorkflow {
  buildRuntimeIncidents();
  clearRecoveryWorkflow();
  return buildRecoveryWorkflow();
}

export type { RecoveryAction, RecoveryStatus, RecoveryWorkflowStatus };
