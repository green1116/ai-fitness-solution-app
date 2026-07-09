/**
 * V79 P8 — Task layer version lock (read-only)
 */
import {
  V78_EXECUTION_FREEZE_VERSION,
  V78_EXECUTION_SIGNOFF_VERSION,
} from "@/lib/execution/v78/signoff/signoff.types";

import { V79_TASK_COMPLIANCE_VERSION } from "../task.compliance";
import { V79_TASK_CONSTRAINT_VERSION } from "../task.constraint";
import { V79_TASK_CONTEXT_VERSION } from "../task.context";
import { V79_TASK_EVALUATION_VERSION } from "../task.evaluation";
import { V79_TASK_POLICY_VERSION } from "../task.policy";
import { V79_TASK_SIMULATION_VERSION } from "../task.simulation";
import { V79_TASK_VERSION } from "../task.types";

import type { LockVersion } from "./signoff.types";
import { V79_TASK_FREEZE_VERSION, V79_TASK_SIGNOFF_VERSION } from "./signoff.types";

export const V79_TASK_LAYER_VERSION_LOCK: LockVersion = {
  taskInventory: V79_TASK_VERSION,
  taskPolicy: V79_TASK_POLICY_VERSION,
  taskContext: V79_TASK_CONTEXT_VERSION,
  taskConstraint: V79_TASK_CONSTRAINT_VERSION,
  taskEvaluation: V79_TASK_EVALUATION_VERSION,
  taskSimulation: V79_TASK_SIMULATION_VERSION,
  taskCompliance: V79_TASK_COMPLIANCE_VERSION,
  signoff: V79_TASK_SIGNOFF_VERSION,
  freeze: V79_TASK_FREEZE_VERSION,
  upstreamV78ExecutionSignoff: V78_EXECUTION_SIGNOFF_VERSION,
  upstreamV78ExecutionFreeze: V78_EXECUTION_FREEZE_VERSION,
};

export const EXPECTED_TASK_LAYER_VERSIONS: LockVersion = V79_TASK_LAYER_VERSION_LOCK;

export function isTaskLayerVersionLockIntact(): boolean {
  const lock = V79_TASK_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function taskVersionLockMatchesExpected(): boolean {
  const lock = V79_TASK_LAYER_VERSION_LOCK;
  const expected = EXPECTED_TASK_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
