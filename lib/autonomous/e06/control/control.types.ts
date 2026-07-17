/**
 * E06-P4 — Enterprise Control Plane types
 * Control layer above E06 Autonomous Workflow Agent
 */

import type { WorkflowExecutionResult } from "../workflow/workflow.types";
import {
  E06_CONTROL_BASE,
  E06_CONTROL_FREEZE_VERSION,
  E06_CONTROL_PLANE_ID,
  E06_CONTROL_VERSION,
  CONTROL_HEALTH_STATUSES,
  CONTROL_MODES,
  CONTROL_PLAN_PHASES,
} from "./control.constants";

export type ControlMode = (typeof CONTROL_MODES)[number];
export type ControlHealthStatus = (typeof CONTROL_HEALTH_STATUSES)[number];
export type ControlPlanPhase = (typeof CONTROL_PLAN_PHASES)[number];

export type ControlDefinition = {
  id: string;
  name: string;
  mode: ControlMode;
  description: string;
  /** Bound E06 workflow id */
  workflowId: string;
  priority: number;
  /** Minimum step completion ratio treated as healthy */
  healthThreshold: number;
  optional: boolean;
  readOnly: true;
};

export type ControlScheduleSlot = {
  id: string;
  order: number;
  controlId: string;
  workflowId: string;
  mode: ControlMode;
  priority: number;
  readOnly: true;
};

export type ControlSchedule = {
  planId: string;
  slotCount: number;
  slots: ControlScheduleSlot[];
  narrative: string;
  readOnly: true;
};

export type ControlRunResult = {
  slotId: string;
  controlId: string;
  workflowId: string;
  mode: ControlMode;
  success: boolean;
  status: WorkflowExecutionResult["status"];
  completedSteps: number;
  stepCount: number;
  effects: string[];
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type ControlHealthEntry = {
  controlId: string;
  workflowId: string;
  status: ControlHealthStatus;
  completionRatio: number;
  healthy: boolean;
  note: string;
  readOnly: true;
};

export type ControlHealthReport = {
  planId: string;
  status: ControlHealthStatus;
  entryCount: number;
  healthyCount: number;
  successRate: number;
  entries: ControlHealthEntry[];
  summary: string;
  readOnly: true;
};

export type ControlPlanResult = {
  success: boolean;
  planeId: typeof E06_CONTROL_PLANE_ID;
  planId: string;
  taskId: string;
  traceId: string;
  schedule: ControlSchedule;
  runs: ControlRunResult[];
  health: ControlHealthReport;
  duration: number;
  status: "result" | "degraded" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type ControlRegistryManifest = {
  planeId: typeof E06_CONTROL_PLANE_ID;
  version: typeof E06_CONTROL_VERSION;
  freezeVersion: typeof E06_CONTROL_FREEZE_VERSION;
  base: typeof E06_CONTROL_BASE;
  controlCount: number;
  modes: ControlMode[];
  controls: ControlDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
