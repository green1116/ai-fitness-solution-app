/**
 * Launch L3 — Production Hardening public exports
 * Isolated namespace: lib/launch/readiness/l3
 */

export {
  ALERT_SEVERITIES,
  AUDIT_EVENT_KINDS,
  BACKUP_STATUSES,
  HEALTH_LEVELS,
  L3_MANAGER_STATUSES,
  L3_READINESS_VERDICTS,
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
  METRIC_KINDS,
  RUNTIME_STATUSES,
  SECURITY_CHECK_RESULTS,
  SECURITY_POLICY_SCOPES,
} from "./runtime/runtime.constants";

export type {
  AssessRuntimeHealthInput,
  HealthLevel,
  RegisterRuntimeInput,
  RuntimeHealth,
  RuntimeMetadata,
  RuntimeNode,
  RuntimeStatus,
  UpdateRuntimeStatusInput,
} from "./runtime/runtime.types";

export {
  clearRuntimes,
  getRuntime,
  listRuntimes,
  registerRuntime,
  updateRuntimeStatus,
} from "./runtime/runtime.status";

export {
  assessRuntimeHealth,
  clearRuntimeHealth,
  getRuntimeHealth,
  listRuntimeHealth,
} from "./runtime/runtime.health";

export type {
  DefineSecurityPolicyInput,
  RunSecurityCheckInput,
  SecurityCheck,
  SecurityCheckResult,
  SecurityMetadata,
  SecurityPolicy,
  SecurityPolicyScope,
} from "./security/security.types";

export {
  clearSecurityPolicies,
  defineSecurityPolicy,
  getSecurityPolicy,
  listSecurityPolicies,
} from "./security/security.policy";

export {
  clearSecurityChecks,
  getSecurityCheck,
  listSecurityChecks,
  runSecurityCheck,
} from "./security/security.check";

export type {
  AlertSeverity,
  MetricKind,
  MonitoringAlert,
  MonitoringMetadata,
  MonitoringMetric,
  RaiseAlertInput,
  RecordMetricInput,
} from "./monitoring/monitoring.types";

export {
  clearMonitoringMetrics,
  getMonitoringMetric,
  listMonitoringMetrics,
  recordMonitoringMetric,
} from "./monitoring/monitoring.metric";

export {
  clearMonitoringAlerts,
  getMonitoringAlert,
  listMonitoringAlerts,
  raiseMonitoringAlert,
} from "./monitoring/monitoring.alert";

export type {
  AssembleAuditTrailInput,
  AuditEvent,
  AuditEventKind,
  AuditMetadata,
  AuditTrail,
  RecordAuditEventInput,
} from "./audit/audit.types";

export {
  clearAuditEvents,
  getAuditEvent,
  listAuditEvents,
  recordAuditEvent,
} from "./audit/audit.event";

export {
  assembleAuditTrail,
  clearAuditTrails,
  getAuditTrail,
  listAuditTrails,
} from "./audit/audit.trail";

export type {
  BackupMetadata,
  BackupRestore,
  BackupSnapshot,
  BackupStatus,
  CaptureBackupSnapshotInput,
  L3ManagerStatus,
  L3ReadinessCheck,
  L3ReadinessResult,
  L3ReadinessVerdict,
  L3RegistryManifest,
  RestoreBackupInput,
} from "./backup/backup.types";

export {
  captureBackupSnapshot,
  clearBackupSnapshots,
  getBackupSnapshot,
  listBackupSnapshots,
  markBackupVerified,
} from "./backup/backup.snapshot";

export {
  clearBackupRestores,
  getBackupRestore,
  listBackupRestores,
  restoreBackupSnapshot,
} from "./backup/backup.restore";

export {
  assertL3HardeningReadinessReady,
  evaluateL3HardeningReadiness,
} from "./backup/backup.readiness";

export {
  clearL3ProductionHardeningLayer,
  createL3ProductionHardeningManager,
  getL3RegistryManifest,
  type L3ProductionHardeningManager,
  type L3ProductionHardeningManagerSnapshot,
} from "./hardening.manager";

export {
  assertLaunchL3ReleaseGatePass,
  checkLaunchL3ReleaseGate,
  LAUNCH_L3_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/launch.release.gate";
