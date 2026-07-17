/**
 * E06-P8 — Autonomous Enterprise OS layer version lock (read-only)
 */

import {
  E06_OPERATION_FREEZE_VERSION,
  E06_OPERATION_VERSION,
} from "../core/operation.constants";
import {
  E06_ACTION_FREEZE_VERSION,
  E06_ACTION_VERSION,
} from "../action/action.constants";
import {
  E06_WORKFLOW_FREEZE_VERSION,
  E06_WORKFLOW_VERSION,
} from "../workflow/workflow.constants";
import {
  E06_CONTROL_FREEZE_VERSION,
  E06_CONTROL_VERSION,
} from "../control/control.constants";
import {
  E06_OPTIMIZATION_FREEZE_VERSION,
  E06_OPTIMIZATION_VERSION,
} from "../optimization/optimization.constants";
import {
  E06_TWIN_FREEZE_VERSION,
  E06_TWIN_VERSION,
} from "../digital-twin/twin.constants";
import {
  E06_AGENT_FREEZE_VERSION,
  E06_AGENT_VERSION,
} from "../agent/agent.constants";

import type { LockVersion } from "./signoff.types";
import {
  E06_AUTONOMOUS_OS_FREEZE_VERSION,
  E06_AUTONOMOUS_SIGNOFF_VERSION,
} from "./signoff.types";

export const E06_AUTONOMOUS_LAYER_VERSION_LOCK: LockVersion = {
  operation: E06_OPERATION_VERSION,
  action: E06_ACTION_VERSION,
  workflow: E06_WORKFLOW_VERSION,
  control: E06_CONTROL_VERSION,
  optimization: E06_OPTIMIZATION_VERSION,
  twin: E06_TWIN_VERSION,
  agent: E06_AGENT_VERSION,
  operationFreeze: E06_OPERATION_FREEZE_VERSION,
  actionFreeze: E06_ACTION_FREEZE_VERSION,
  workflowFreeze: E06_WORKFLOW_FREEZE_VERSION,
  controlFreeze: E06_CONTROL_FREEZE_VERSION,
  optimizationFreeze: E06_OPTIMIZATION_FREEZE_VERSION,
  twinFreeze: E06_TWIN_FREEZE_VERSION,
  agentFreeze: E06_AGENT_FREEZE_VERSION,
  signoff: E06_AUTONOMOUS_SIGNOFF_VERSION,
  freeze: E06_AUTONOMOUS_OS_FREEZE_VERSION,
};

export const EXPECTED_AUTONOMOUS_LAYER_VERSIONS: LockVersion =
  E06_AUTONOMOUS_LAYER_VERSION_LOCK;

export function isAutonomousLayerVersionLockIntact(): boolean {
  const lock = E06_AUTONOMOUS_LAYER_VERSION_LOCK;
  return Object.values(lock).every(
    (v) => typeof v === "string" && v.length > 0,
  );
}

export function autonomousVersionLockMatchesExpected(): boolean {
  const lock = E06_AUTONOMOUS_LAYER_VERSION_LOCK;
  const expected = EXPECTED_AUTONOMOUS_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
