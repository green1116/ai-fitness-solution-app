/**
 * E11-P7 — Enterprise Control Plane types
 */

import type { CloudMetadata } from "../types/cloud.types";
import {
  COMPLIANCE_STATES,
  CONTROL_COMMAND_KINDS,
  CONTROL_COMMAND_STATUSES,
  CONTROL_PLANE_MANAGER_STATUSES,
  CONTROL_PLANE_SCOPES,
  CONTROL_PLANE_STATUSES,
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_FREEZE_VERSION,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
  GLOBAL_POLICY_ENFORCEMENT,
  GLOBAL_POLICY_KINDS,
  ORCHESTRATION_ACTIONS,
} from "./control-plane.constants";

export type ControlPlaneScope = (typeof CONTROL_PLANE_SCOPES)[number];
export type ControlPlaneStatus = (typeof CONTROL_PLANE_STATUSES)[number];
export type ControlCommandKind = (typeof CONTROL_COMMAND_KINDS)[number];
export type ControlCommandStatus = (typeof CONTROL_COMMAND_STATUSES)[number];
export type GlobalPolicyKind = (typeof GLOBAL_POLICY_KINDS)[number];
export type GlobalPolicyEnforcement = (typeof GLOBAL_POLICY_ENFORCEMENT)[number];
export type ComplianceState = (typeof COMPLIANCE_STATES)[number];
export type OrchestrationAction = (typeof ORCHESTRATION_ACTIONS)[number];
export type ControlPlaneManagerStatus =
  (typeof CONTROL_PLANE_MANAGER_STATUSES)[number];

export type { CloudMetadata };

/** Control plane domain model. */
export type ControlPlaneRecord = {
  id: string;
  name: string;
  scope: ControlPlaneScope;
  status: ControlPlaneStatus;
  organizationId?: string;
  tenantId?: string;
  runtimeId?: string;
  metadata: CloudMetadata;
  createdAt: string;
};

export type RegisterControlPlaneInput = {
  id?: string;
  name: string;
  scope?: ControlPlaneScope;
  status?: ControlPlaneStatus;
  organizationId?: string;
  tenantId?: string;
  runtimeId?: string;
  metadata?: CloudMetadata;
};

/** Global policy definition. */
export type GlobalPolicy = {
  id: string;
  name: string;
  kind: GlobalPolicyKind;
  enforcement: GlobalPolicyEnforcement;
  scope: ControlPlaneScope;
  tenantId?: string;
  organizationId?: string;
  rules: CloudMetadata;
  metadata: CloudMetadata;
  createdAt: string;
};

export type CreateGlobalPolicyInput = {
  id?: string;
  name: string;
  kind: GlobalPolicyKind;
  enforcement?: GlobalPolicyEnforcement;
  scope?: ControlPlaneScope;
  tenantId?: string;
  organizationId?: string;
  rules?: CloudMetadata;
  metadata?: CloudMetadata;
};

export type GlobalPolicyEvaluation = {
  policyId: string;
  kind: GlobalPolicyKind;
  allowed: boolean;
  enforcement: GlobalPolicyEnforcement;
  reason: string;
  evaluatedAt: string;
};

/** Command center record. */
export type ControlCommand = {
  id: string;
  kind: ControlCommandKind;
  status: ControlCommandStatus;
  title: string;
  tenantId?: string;
  runtimeId?: string;
  organizationId?: string;
  payload: CloudMetadata;
  result?: string;
  error?: string;
  metadata: CloudMetadata;
  issuedAt: string;
  startedAt?: string;
  finishedAt?: string;
};

export type IssueControlCommandInput = {
  id?: string;
  kind: ControlCommandKind;
  title: string;
  tenantId?: string;
  runtimeId?: string;
  organizationId?: string;
  payload?: CloudMetadata;
  metadata?: CloudMetadata;
};

export type CommandDispatchResult = {
  commandId: string;
  kind: ControlCommandKind;
  status: ControlCommandStatus;
  message: string;
  details?: CloudMetadata;
};

/** Runtime orchestration plan. */
export type OrchestrationStep = {
  runtimeId: string;
  action: OrchestrationAction;
  reason: string;
  applied: boolean;
  message: string;
};

export type OrchestrationPlan = {
  id: string;
  title: string;
  tenantId?: string;
  steps: OrchestrationStep[];
  metadata: CloudMetadata;
  createdAt: string;
  finishedAt?: string;
};

export type CreateOrchestrationInput = {
  id?: string;
  title: string;
  tenantId?: string;
  runtimeIds?: string[];
  actions?: OrchestrationAction[];
  metadata?: CloudMetadata;
};

export type OrchestrationResult = {
  planId: string;
  succeeded: number;
  failed: number;
  steps: OrchestrationStep[];
  message: string;
};

/** Compliance state. */
export type ComplianceFinding = {
  id: string;
  state: ComplianceState;
  category: string;
  message: string;
  tenantId?: string;
  runtimeId?: string;
  evidence: CloudMetadata;
  detectedAt: string;
};

export type ComplianceStateReport = {
  overall: ComplianceState;
  compliantCount: number;
  warningCount: number;
  nonCompliantCount: number;
  findings: ComplianceFinding[];
  assessedAt: string;
};

/** Control snapshot. */
export type ControlSnapshot = {
  snapshotId: string;
  planeId: typeof E11_CONTROL_PLANE_ID;
  version: typeof E11_CONTROL_PLANE_VERSION;
  planeCount: number;
  policyCount: number;
  commandCount: number;
  runtimeCount: number;
  tenantCount: number;
  compliance: ComplianceState;
  observabilityEvents: number;
  governanceUtilization: number;
  autonomousOperations: number;
  metadata: CloudMetadata;
  capturedAt: string;
};

export type ControlPlaneRegistryManifest = {
  planeId: typeof E11_CONTROL_PLANE_ID;
  version: typeof E11_CONTROL_PLANE_VERSION;
  freezeVersion: typeof E11_CONTROL_PLANE_FREEZE_VERSION;
  base: typeof E11_CONTROL_PLANE_BASE;
  planeCount: number;
  policyCount: number;
  commandCount: number;
  orchestrationCount: number;
};
