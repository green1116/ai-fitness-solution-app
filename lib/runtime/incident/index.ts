/**
 * RSO — Incident management public exports
 */

export {
  INCIDENT_SEVERITIES,
  INCIDENT_STATES,
  INCIDENT_SURFACE_STATUSES,
  incidentSeverityFromSignalLevel,
  incidentStateFromSeverity,
  aggregateIncidentSurfaceStatus,
  type IncidentSeverity,
  type IncidentState,
  type IncidentSurfaceStatus,
} from "./incident-severity";

export {
  RSO_3_ID,
  RUNTIME_INCIDENT_CAPABILITY,
  RUNTIME_INCIDENT_VERSION,
  RSO2_APPLICATION_MONITORING_BASELINE,
  buildRuntimeIncidents,
  getRuntimeIncidents,
  runtimeIncidentsFingerprint,
  clearRuntimeIncidents,
  ensureMonitoringThenBuildRuntimeIncidents,
  type RuntimeIncident,
  type RuntimeIncidents,
} from "./runtime-incidents";
