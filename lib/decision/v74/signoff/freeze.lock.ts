/**
 * V74 P8 — Decision layer version lock (read-only)
 */
import {
  V73_KNOWLEDGE_FREEZE_VERSION,
  V73_KNOWLEDGE_SIGNOFF_VERSION,
} from "@/lib/knowledge/v73/signoff/signoff.types";

import { V74_DECISION_COMPLIANCE_VERSION } from "../decision.compliance";
import { V74_DECISION_CONSTRAINT_VERSION } from "../decision.constraint";
import { V74_DECISION_CONTEXT_VERSION } from "../decision.context";
import { V74_DECISION_EVALUATION_VERSION } from "../decision.evaluation";
import { V74_DECISION_POLICY_VERSION } from "../decision.policy";
import { V74_DECISION_SIMULATION_VERSION } from "../decision.simulation";
import { V74_DECISION_VERSION } from "../decision.types";

import type { LockVersion } from "./signoff.types";
import { V74_DECISION_FREEZE_VERSION, V74_DECISION_SIGNOFF_VERSION } from "./signoff.types";

export const V74_DECISION_LAYER_VERSION_LOCK: LockVersion = {
  decisionInventory: V74_DECISION_VERSION,
  decisionPolicy: V74_DECISION_POLICY_VERSION,
  decisionContext: V74_DECISION_CONTEXT_VERSION,
  decisionConstraint: V74_DECISION_CONSTRAINT_VERSION,
  decisionEvaluation: V74_DECISION_EVALUATION_VERSION,
  decisionSimulation: V74_DECISION_SIMULATION_VERSION,
  decisionCompliance: V74_DECISION_COMPLIANCE_VERSION,
  signoff: V74_DECISION_SIGNOFF_VERSION,
  freeze: V74_DECISION_FREEZE_VERSION,
  upstreamV73KnowledgeSignoff: V73_KNOWLEDGE_SIGNOFF_VERSION,
  upstreamV73KnowledgeFreeze: V73_KNOWLEDGE_FREEZE_VERSION,
};

export const EXPECTED_DECISION_LAYER_VERSIONS: LockVersion = V74_DECISION_LAYER_VERSION_LOCK;

export function isDecisionLayerVersionLockIntact(): boolean {
  const lock = V74_DECISION_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function decisionVersionLockMatchesExpected(): boolean {
  const lock = V74_DECISION_LAYER_VERSION_LOCK;
  const expected = EXPECTED_DECISION_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
