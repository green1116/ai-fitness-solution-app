/**
 * Product Operations — Incident types
 */

import type {
  OPS_INCIDENT_SEVERITIES,
  OPS_INCIDENT_STATUSES,
} from "../console/console.constants";

export type OpsIncidentSeverity = (typeof OPS_INCIDENT_SEVERITIES)[number];
export type OpsIncidentStatus = (typeof OPS_INCIDENT_STATUSES)[number];
export type IncidentMetadata = Record<string, unknown>;

export type OpsIncident = {
  id: string;
  surfaceId: string;
  title: string;
  severity: OpsIncidentSeverity;
  status: OpsIncidentStatus;
  detail: string;
  metadata: IncidentMetadata;
  openedAt: string;
  updatedAt: string;
};

export type OpenOpsIncidentInput = {
  id?: string;
  surfaceId: string;
  title: string;
  severity: OpsIncidentSeverity;
  metadata?: IncidentMetadata;
};

export type UpdateOpsIncidentStatusInput = {
  incidentId: string;
  status: OpsIncidentStatus;
};
