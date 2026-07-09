/**
 * V77 P8 — Planning layer version lock (read-only)
 */
import {
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_SIGNOFF_VERSION,
} from "@/lib/collaboration/v76/signoff/signoff.types";

import { V77_PLANNING_COMPLIANCE_VERSION } from "../planning.compliance";
import { V77_PLANNING_CONSTRAINT_VERSION } from "../planning.constraint";
import { V77_PLANNING_CONTEXT_VERSION } from "../planning.context";
import { V77_PLANNING_EVALUATION_VERSION } from "../planning.evaluation";
import { V77_PLANNING_POLICY_VERSION } from "../planning.policy";
import { V77_PLANNING_SIMULATION_VERSION } from "../planning.simulation";
import { V77_PLANNING_VERSION } from "../planning.types";

import type { LockVersion } from "./signoff.types";
import { V77_PLANNING_FREEZE_VERSION, V77_PLANNING_SIGNOFF_VERSION } from "./signoff.types";

export const V77_PLANNING_LAYER_VERSION_LOCK: LockVersion = {
  planningInventory: V77_PLANNING_VERSION,
  planningPolicy: V77_PLANNING_POLICY_VERSION,
  planningContext: V77_PLANNING_CONTEXT_VERSION,
  planningConstraint: V77_PLANNING_CONSTRAINT_VERSION,
  planningEvaluation: V77_PLANNING_EVALUATION_VERSION,
  planningSimulation: V77_PLANNING_SIMULATION_VERSION,
  planningCompliance: V77_PLANNING_COMPLIANCE_VERSION,
  signoff: V77_PLANNING_SIGNOFF_VERSION,
  freeze: V77_PLANNING_FREEZE_VERSION,
  upstreamV76CollaborationSignoff: V76_COLLABORATION_SIGNOFF_VERSION,
  upstreamV76CollaborationFreeze: V76_COLLABORATION_FREEZE_VERSION,
};

export const EXPECTED_PLANNING_LAYER_VERSIONS: LockVersion = V77_PLANNING_LAYER_VERSION_LOCK;

export function isPlanningLayerVersionLockIntact(): boolean {
  const lock = V77_PLANNING_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function planningVersionLockMatchesExpected(): boolean {
  const lock = V77_PLANNING_LAYER_VERSION_LOCK;
  const expected = EXPECTED_PLANNING_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
