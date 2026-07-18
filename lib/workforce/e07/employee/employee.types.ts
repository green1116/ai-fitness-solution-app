/**
 * E07-P2 — AI Employee Runtime types
 * Employee layer above E07 Digital Workforce Foundation
 */

import type { WorkforceExecutionResult } from "../runtime/workforce.executor";
import {
  E07_EMPLOYEE_BASE,
  E07_EMPLOYEE_FREEZE_VERSION,
  E07_EMPLOYEE_RUNTIME_ID,
  E07_EMPLOYEE_VERSION,
  EMPLOYEE_INSTANCE_PHASES,
  EMPLOYEE_JOB_KINDS,
} from "./employee.constants";

export type EmployeeJobKind = (typeof EMPLOYEE_JOB_KINDS)[number];
export type EmployeeInstancePhase =
  (typeof EMPLOYEE_INSTANCE_PHASES)[number];

export type EmployeeTaskAssignment = {
  /** Bound E07 worker id */
  workerId: string;
  /** Skill the worker applies for this task */
  skillId: string;
  objective: string;
  readOnly: true;
};

export type EmployeeDefinition = {
  id: string;
  name: string;
  jobKind: EmployeeJobKind;
  jobTitle: string;
  description: string;
  /** Ordered task assignments executed as the employee's duty cycle */
  tasks: EmployeeTaskAssignment[];
  optional: boolean;
  readOnly: true;
};

export type EmployeeTaskPlanStep = {
  id: string;
  order: number;
  workerId: string;
  workerRole: string;
  skillId: string;
  skillKind: string;
  objective: string;
  title: string;
  readOnly: true;
};

export type EmployeeTaskPlan = {
  employeeId: string;
  jobKind: EmployeeJobKind;
  taskCount: number;
  steps: EmployeeTaskPlanStep[];
  narrative: string;
  readOnly: true;
};

export type EmployeeTaskResult = {
  stepId: string;
  order: number;
  workerId: string;
  skillId: string;
  success: boolean;
  status: WorkforceExecutionResult["status"];
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type EmployeeExecutionResult = {
  success: boolean;
  employeeId: string;
  jobKind: EmployeeJobKind;
  jobTitle: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: EmployeeTaskPlan;
  taskResults: EmployeeTaskResult[];
  completedTasks: number;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type EmployeeRegistryManifest = {
  runtimeId: typeof E07_EMPLOYEE_RUNTIME_ID;
  version: typeof E07_EMPLOYEE_VERSION;
  freezeVersion: typeof E07_EMPLOYEE_FREEZE_VERSION;
  base: typeof E07_EMPLOYEE_BASE;
  employeeCount: number;
  jobKinds: EmployeeJobKind[];
  employees: EmployeeDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
