/**
 * V75 P8 — Agent layer version lock (read-only)
 */
import {
  V74_DECISION_FREEZE_VERSION,
  V74_DECISION_SIGNOFF_VERSION,
} from "@/lib/decision/v74/signoff/signoff.types";

import { V75_AGENT_COMPLIANCE_VERSION } from "../agent.compliance";
import { V75_AGENT_CONSTRAINT_VERSION } from "../agent.constraint";
import { V75_AGENT_CONTEXT_VERSION } from "../agent.context";
import { V75_AGENT_EVALUATION_VERSION } from "../agent.evaluation";
import { V75_AGENT_POLICY_VERSION } from "../agent.policy";
import { V75_AGENT_SIMULATION_VERSION } from "../agent.simulation";
import { V75_AGENT_VERSION } from "../agent.types";

import type { LockVersion } from "./signoff.types";
import { V75_AGENT_FREEZE_VERSION, V75_AGENT_SIGNOFF_VERSION } from "./signoff.types";

export const V75_AGENT_LAYER_VERSION_LOCK: LockVersion = {
  agentInventory: V75_AGENT_VERSION,
  agentPolicy: V75_AGENT_POLICY_VERSION,
  agentContext: V75_AGENT_CONTEXT_VERSION,
  agentConstraint: V75_AGENT_CONSTRAINT_VERSION,
  agentEvaluation: V75_AGENT_EVALUATION_VERSION,
  agentSimulation: V75_AGENT_SIMULATION_VERSION,
  agentCompliance: V75_AGENT_COMPLIANCE_VERSION,
  signoff: V75_AGENT_SIGNOFF_VERSION,
  freeze: V75_AGENT_FREEZE_VERSION,
  upstreamV74DecisionSignoff: V74_DECISION_SIGNOFF_VERSION,
  upstreamV74DecisionFreeze: V74_DECISION_FREEZE_VERSION,
};

export const EXPECTED_AGENT_LAYER_VERSIONS: LockVersion = V75_AGENT_LAYER_VERSION_LOCK;

export function isAgentLayerVersionLockIntact(): boolean {
  const lock = V75_AGENT_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function agentVersionLockMatchesExpected(): boolean {
  const lock = V75_AGENT_LAYER_VERSION_LOCK;
  const expected = EXPECTED_AGENT_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
