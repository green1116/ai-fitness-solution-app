/**
 * E11-P6 — Autonomous Operations types
 */

import type { CloudMetadata } from "../types/cloud.types";
import {
  ACTION_POLICY_MODES,
  AUTONOMOUS_MANAGER_STATUSES,
  AUTONOMOUS_OPERATION_KINDS,
  AUTONOMOUS_OPERATION_STATUSES,
  E11_AUTONOMOUS_BASE,
  E11_AUTONOMOUS_FREEZE_VERSION,
  E11_AUTONOMOUS_ID,
  E11_AUTONOMOUS_VERSION,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
} from "./autonomous.constants";

export type AutonomousOperationKind =
  (typeof AUTONOMOUS_OPERATION_KINDS)[number];
export type AutonomousOperationStatus =
  (typeof AUTONOMOUS_OPERATION_STATUSES)[number];
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type ActionPolicyMode = (typeof ACTION_POLICY_MODES)[number];
export type AutonomousManagerStatus =
  (typeof AUTONOMOUS_MANAGER_STATUSES)[number];

export type { CloudMetadata };

/** Autonomous operation model. */
export type AutonomousOperation = {
  id: string;
  kind: AutonomousOperationKind;
  status: AutonomousOperationStatus;
  title: string;
  runtimeId?: string;
  tenantId?: string;
  anomalyId?: string;
  incidentId?: string;
  metadata: CloudMetadata;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  result?: string;
  error?: string;
};

export type CreateAutonomousOperationInput = {
  id?: string;
  kind: AutonomousOperationKind;
  title: string;
  runtimeId?: string;
  tenantId?: string;
  anomalyId?: string;
  incidentId?: string;
  metadata?: CloudMetadata;
};

/** Incident workflow record. */
export type AutonomousIncident = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  anomalyId?: string;
  runtimeId?: string;
  tenantId?: string;
  operationIds: string[];
  metadata: CloudMetadata;
  openedAt: string;
  resolvedAt?: string;
};

export type OpenIncidentInput = {
  id?: string;
  title: string;
  severity?: IncidentSeverity;
  anomalyId?: string;
  runtimeId?: string;
  tenantId?: string;
  metadata?: CloudMetadata;
};

/** Autonomous action policy. */
export type AutonomousActionPolicy = {
  id: string;
  name: string;
  mode: ActionPolicyMode;
  /** Allowed operation kinds under AUTO/ASSISTED. */
  allowedKinds: AutonomousOperationKind[];
  /** Minimum anomaly score to auto-act. */
  minAnomalyScore: number;
  /** Auto-open incidents for severity >= this. */
  autoIncidentSeverity: IncidentSeverity;
  tenantId?: string;
  metadata: CloudMetadata;
  createdAt: string;
};

export type CreateActionPolicyInput = {
  id?: string;
  name: string;
  mode?: ActionPolicyMode;
  allowedKinds?: AutonomousOperationKind[];
  minAnomalyScore?: number;
  autoIncidentSeverity?: IncidentSeverity;
  tenantId?: string;
  metadata?: CloudMetadata;
};

export type RecoveryResult = {
  operationId: string;
  runtimeId: string;
  recovered: boolean;
  fromStatus: string;
  toStatus: string;
  message: string;
};

export type HealResult = {
  operationId: string;
  healed: boolean;
  actions: string[];
  message: string;
};

export type OptimizeResult = {
  operationId: string;
  optimized: boolean;
  recommendations: string[];
  utilization: number;
  message: string;
};

export type AutonomousRegistryManifest = {
  autonomousId: typeof E11_AUTONOMOUS_ID;
  version: typeof E11_AUTONOMOUS_VERSION;
  freezeVersion: typeof E11_AUTONOMOUS_FREEZE_VERSION;
  base: typeof E11_AUTONOMOUS_BASE;
  operationCount: number;
  incidentCount: number;
  policyCount: number;
};
