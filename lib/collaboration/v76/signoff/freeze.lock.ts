/**
 * V76 P8 — Collaboration layer version lock (read-only)
 */
import {
  V75_AGENT_FREEZE_VERSION,
  V75_AGENT_SIGNOFF_VERSION,
} from "@/lib/agent/v75/signoff/signoff.types";

import { V76_COLLABORATION_COMPLIANCE_VERSION } from "../collaboration.compliance";
import { V76_COLLABORATION_CONSTRAINT_VERSION } from "../collaboration.constraint";
import { V76_COLLABORATION_CONTEXT_VERSION } from "../collaboration.context";
import { V76_COLLABORATION_EVALUATION_VERSION } from "../collaboration.evaluation";
import { V76_COLLABORATION_POLICY_VERSION } from "../collaboration.policy";
import { V76_COLLABORATION_SIMULATION_VERSION } from "../collaboration.simulation";
import { V76_COLLABORATION_VERSION } from "../collaboration.types";

import type { LockVersion } from "./signoff.types";
import { V76_COLLABORATION_FREEZE_VERSION, V76_COLLABORATION_SIGNOFF_VERSION } from "./signoff.types";

export const V76_COLLABORATION_LAYER_VERSION_LOCK: LockVersion = {
  collaborationInventory: V76_COLLABORATION_VERSION,
  collaborationPolicy: V76_COLLABORATION_POLICY_VERSION,
  collaborationContext: V76_COLLABORATION_CONTEXT_VERSION,
  collaborationConstraint: V76_COLLABORATION_CONSTRAINT_VERSION,
  collaborationEvaluation: V76_COLLABORATION_EVALUATION_VERSION,
  collaborationSimulation: V76_COLLABORATION_SIMULATION_VERSION,
  collaborationCompliance: V76_COLLABORATION_COMPLIANCE_VERSION,
  signoff: V76_COLLABORATION_SIGNOFF_VERSION,
  freeze: V76_COLLABORATION_FREEZE_VERSION,
  upstreamV75AgentSignoff: V75_AGENT_SIGNOFF_VERSION,
  upstreamV75AgentFreeze: V75_AGENT_FREEZE_VERSION,
};

export const EXPECTED_COLLABORATION_LAYER_VERSIONS: LockVersion =
  V76_COLLABORATION_LAYER_VERSION_LOCK;

export function isCollaborationLayerVersionLockIntact(): boolean {
  const lock = V76_COLLABORATION_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function collaborationVersionLockMatchesExpected(): boolean {
  const lock = V76_COLLABORATION_LAYER_VERSION_LOCK;
  const expected = EXPECTED_COLLABORATION_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
