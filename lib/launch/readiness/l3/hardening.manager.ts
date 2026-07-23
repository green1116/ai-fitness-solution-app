/**
 * Launch L3 — Production Hardening Manager
 */

import {
  assembleAuditTrail,
  clearAuditTrails,
  getAuditTrail,
  listAuditTrails,
} from "./audit/audit.trail";
import {
  clearAuditEvents,
  getAuditEvent,
  listAuditEvents,
  recordAuditEvent,
} from "./audit/audit.event";
import type {
  AssembleAuditTrailInput,
  AuditEvent,
  AuditTrail,
  RecordAuditEventInput,
} from "./audit/audit.types";
import {
  assertL3HardeningReadinessReady,
  evaluateL3HardeningReadiness,
} from "./backup/backup.readiness";
import {
  clearBackupRestores,
  getBackupRestore,
  listBackupRestores,
  restoreBackupSnapshot,
} from "./backup/backup.restore";
import {
  captureBackupSnapshot,
  clearBackupSnapshots,
  getBackupSnapshot,
  listBackupSnapshots,
} from "./backup/backup.snapshot";
import type {
  BackupRestore,
  BackupSnapshot,
  CaptureBackupSnapshotInput,
  L3ManagerStatus,
  L3ReadinessResult,
  L3RegistryManifest,
  RestoreBackupInput,
} from "./backup/backup.types";
import {
  clearMonitoringAlerts,
  getMonitoringAlert,
  listMonitoringAlerts,
  raiseMonitoringAlert,
} from "./monitoring/monitoring.alert";
import {
  clearMonitoringMetrics,
  getMonitoringMetric,
  listMonitoringMetrics,
  recordMonitoringMetric,
} from "./monitoring/monitoring.metric";
import type {
  MonitoringAlert,
  MonitoringMetric,
  RaiseAlertInput,
  RecordMetricInput,
} from "./monitoring/monitoring.types";
import {
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
} from "./runtime/runtime.constants";
import {
  assessRuntimeHealth,
  clearRuntimeHealth,
  getRuntimeHealth,
  listRuntimeHealth,
} from "./runtime/runtime.health";
import {
  clearRuntimes,
  getRuntime,
  listRuntimes,
  registerRuntime,
  updateRuntimeStatus,
} from "./runtime/runtime.status";
import type {
  AssessRuntimeHealthInput,
  RegisterRuntimeInput,
  RuntimeHealth,
  RuntimeNode,
  UpdateRuntimeStatusInput,
} from "./runtime/runtime.types";
import {
  clearSecurityChecks,
  getSecurityCheck,
  listSecurityChecks,
  runSecurityCheck,
} from "./security/security.check";
import {
  clearSecurityPolicies,
  defineSecurityPolicy,
  getSecurityPolicy,
  listSecurityPolicies,
} from "./security/security.policy";
import type {
  DefineSecurityPolicyInput,
  RunSecurityCheckInput,
  SecurityCheck,
  SecurityPolicy,
} from "./security/security.types";

export type L3ProductionHardeningManagerSnapshot = {
  managerId: string;
  status: L3ManagerStatus;
  layerId: typeof LAUNCH_L3_PRODUCTION_HARDENING_ID;
  version: typeof LAUNCH_L3_PRODUCTION_HARDENING_VERSION;
  runtimeCount: number;
  policyCount: number;
  metricCount: number;
  auditEventCount: number;
  snapshotCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type L3ProductionHardeningManager = {
  initialize: () => L3ProductionHardeningManagerSnapshot;
  start: () => L3ProductionHardeningManagerSnapshot;
  stop: () => L3ProductionHardeningManagerSnapshot;
  status: () => L3ProductionHardeningManagerSnapshot;
  registerRuntime: (input: RegisterRuntimeInput) => RuntimeNode;
  updateRuntimeStatus: (input: UpdateRuntimeStatusInput) => RuntimeNode;
  assessHealth: (input: AssessRuntimeHealthInput) => RuntimeHealth;
  definePolicy: (input: DefineSecurityPolicyInput) => SecurityPolicy;
  runSecurityCheck: (input: RunSecurityCheckInput) => SecurityCheck;
  recordMetric: (input: RecordMetricInput) => MonitoringMetric;
  raiseAlert: (input: RaiseAlertInput) => MonitoringAlert;
  recordAudit: (input: RecordAuditEventInput) => AuditEvent;
  assembleTrail: (input: AssembleAuditTrailInput) => AuditTrail;
  captureSnapshot: (input: CaptureBackupSnapshotInput) => BackupSnapshot;
  restoreBackup: (input: RestoreBackupInput) => BackupRestore;
  evaluateReadiness: () => L3ReadinessResult;
  manifest: () => L3RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getL3RegistryManifest(): L3RegistryManifest {
  return {
    foundationId: LAUNCH_L3_PRODUCTION_HARDENING_ID,
    version: LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
    freezeVersion: LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
    base: LAUNCH_L3_PRODUCTION_HARDENING_BASE,
    runtimeCount: listRuntimes().length,
    healthCount: listRuntimeHealth().length,
    policyCount: listSecurityPolicies().length,
    securityCheckCount: listSecurityChecks().length,
    metricCount: listMonitoringMetrics().length,
    alertCount: listMonitoringAlerts().length,
    auditEventCount: listAuditEvents().length,
    trailCount: listAuditTrails().length,
    snapshotCount: listBackupSnapshots().length,
    restoreCount: listBackupRestores().length,
  };
}

export function clearL3ProductionHardeningLayer(): void {
  clearBackupRestores();
  clearBackupSnapshots();
  clearAuditTrails();
  clearAuditEvents();
  clearMonitoringAlerts();
  clearMonitoringMetrics();
  clearSecurityChecks();
  clearSecurityPolicies();
  clearRuntimeHealth();
  clearRuntimes();
}

export function createL3ProductionHardeningManager(options?: {
  managerId?: string;
}): L3ProductionHardeningManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-l3-hard-mgr");
  let state: L3ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): L3ProductionHardeningManagerSnapshot {
    const reg = getL3RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_L3_PRODUCTION_HARDENING_ID,
      version: LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
      runtimeCount: reg.runtimeCount,
      policyCount: reg.policyCount,
      metricCount: reg.metricCount,
      auditEventCount: reg.auditEventCount,
      snapshotCount: reg.snapshotCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): L3ProductionHardeningManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearL3ProductionHardeningLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): L3ProductionHardeningManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): L3ProductionHardeningManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerRuntime: (input) => {
      assertRunning("registerRuntime");
      return registerRuntime(input);
    },
    updateRuntimeStatus: (input) => {
      assertRunning("updateRuntimeStatus");
      return updateRuntimeStatus(input);
    },
    assessHealth: (input) => {
      assertRunning("assessHealth");
      return assessRuntimeHealth(input);
    },
    definePolicy: (input) => {
      assertRunning("definePolicy");
      return defineSecurityPolicy(input);
    },
    runSecurityCheck: (input) => {
      assertRunning("runSecurityCheck");
      return runSecurityCheck(input);
    },
    recordMetric: (input) => {
      assertRunning("recordMetric");
      return recordMonitoringMetric(input);
    },
    raiseAlert: (input) => {
      assertRunning("raiseAlert");
      return raiseMonitoringAlert(input);
    },
    recordAudit: (input) => {
      assertRunning("recordAudit");
      return recordAuditEvent(input);
    },
    assembleTrail: (input) => {
      assertRunning("assembleTrail");
      return assembleAuditTrail(input);
    },
    captureSnapshot: (input) => {
      assertRunning("captureSnapshot");
      return captureBackupSnapshot(input);
    },
    restoreBackup: (input) => {
      assertRunning("restoreBackup");
      return restoreBackupSnapshot(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateL3HardeningReadiness();
    },
    manifest: getL3RegistryManifest,
  };
}

export {
  assertL3HardeningReadinessReady,
  getAuditEvent,
  getAuditTrail,
  getBackupRestore,
  getBackupSnapshot,
  getMonitoringAlert,
  getMonitoringMetric,
  getRuntime,
  getRuntimeHealth,
  getSecurityCheck,
  getSecurityPolicy,
  listAuditEvents,
  listAuditTrails,
  listBackupRestores,
  listBackupSnapshots,
  listMonitoringAlerts,
  listMonitoringMetrics,
  listRuntimeHealth,
  listRuntimes,
  listSecurityChecks,
  listSecurityPolicies,
};
