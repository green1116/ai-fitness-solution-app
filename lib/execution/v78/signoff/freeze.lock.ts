/**
 * V78 P8 — Execution layer version lock (read-only)
 */
import {
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_SIGNOFF_VERSION,
} from "@/lib/planning/v77/signoff/signoff.types";

import { V78_EXECUTION_COMPLIANCE_VERSION } from "../execution.compliance";
import { V78_EXECUTION_CONSTRAINT_VERSION } from "../execution.constraint";
import { V78_EXECUTION_CONTEXT_VERSION } from "../execution.context";
import { V78_EXECUTION_EVALUATION_VERSION } from "../execution.evaluation";
import { V78_EXECUTION_POLICY_VERSION } from "../execution.policy";
import { V78_EXECUTION_SIMULATION_VERSION } from "../execution.simulation";
import { V78_EXECUTION_VERSION } from "../execution.types";

import type { LockVersion } from "./signoff.types";
import { V78_EXECUTION_FREEZE_VERSION, V78_EXECUTION_SIGNOFF_VERSION } from "./signoff.types";

export const V78_EXECUTION_LAYER_VERSION_LOCK: LockVersion = {
  executionInventory: V78_EXECUTION_VERSION,
  executionPolicy: V78_EXECUTION_POLICY_VERSION,
  executionContext: V78_EXECUTION_CONTEXT_VERSION,
  executionConstraint: V78_EXECUTION_CONSTRAINT_VERSION,
  executionEvaluation: V78_EXECUTION_EVALUATION_VERSION,
  executionSimulation: V78_EXECUTION_SIMULATION_VERSION,
  executionCompliance: V78_EXECUTION_COMPLIANCE_VERSION,
  signoff: V78_EXECUTION_SIGNOFF_VERSION,
  freeze: V78_EXECUTION_FREEZE_VERSION,
  upstreamV77PlanningSignoff: V77_PLANNING_SIGNOFF_VERSION,
  upstreamV77PlanningFreeze: V77_PLANNING_FREEZE_VERSION,
};

export const EXPECTED_EXECUTION_LAYER_VERSIONS: LockVersion = V78_EXECUTION_LAYER_VERSION_LOCK;

export function isExecutionLayerVersionLockIntact(): boolean {
  const lock = V78_EXECUTION_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function executionVersionLockMatchesExpected(): boolean {
  const lock = V78_EXECUTION_LAYER_VERSION_LOCK;
  const expected = EXPECTED_EXECUTION_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
