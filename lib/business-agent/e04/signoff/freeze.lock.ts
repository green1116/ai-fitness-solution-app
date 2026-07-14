/**
 * E04-P8 — Business Agent Platform layer version lock (read-only)
 */

import {
  E04_BUSINESS_AGENT_FREEZE_VERSION,
  E04_BUSINESS_AGENT_VERSION,
} from "../core/business-agent.constants";
import {
  E04_WORKFLOW_FREEZE_VERSION,
  E04_WORKFLOW_VERSION,
} from "../workflow/workflow.constants";
import {
  E04_PROCESS_FREEZE_VERSION,
  E04_PROCESS_VERSION,
} from "../process/process.constants";
import {
  E04_DECISION_FREEZE_VERSION,
  E04_DECISION_VERSION,
} from "../decision/decision.constants";
import {
  E04_MEMORY_FREEZE_VERSION,
  E04_MEMORY_VERSION,
} from "../memory/memory.constants";
import {
  E04_KNOWLEDGE_FREEZE_VERSION,
  E04_KNOWLEDGE_VERSION,
} from "../knowledge/knowledge.constants";
import {
  E04_COLLABORATION_FREEZE_VERSION,
  E04_COLLABORATION_VERSION,
} from "../collaboration/collaboration.constants";

import type { LockVersion } from "./signoff.types";
import {
  E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
  E04_BUSINESS_AGENT_SIGNOFF_VERSION,
} from "./signoff.types";

export const E04_BUSINESS_AGENT_LAYER_VERSION_LOCK: LockVersion = {
  foundation: E04_BUSINESS_AGENT_VERSION,
  workflow: E04_WORKFLOW_VERSION,
  process: E04_PROCESS_VERSION,
  decision: E04_DECISION_VERSION,
  memory: E04_MEMORY_VERSION,
  knowledge: E04_KNOWLEDGE_VERSION,
  collaboration: E04_COLLABORATION_VERSION,
  foundationFreeze: E04_BUSINESS_AGENT_FREEZE_VERSION,
  workflowFreeze: E04_WORKFLOW_FREEZE_VERSION,
  processFreeze: E04_PROCESS_FREEZE_VERSION,
  decisionFreeze: E04_DECISION_FREEZE_VERSION,
  memoryFreeze: E04_MEMORY_FREEZE_VERSION,
  knowledgeFreeze: E04_KNOWLEDGE_FREEZE_VERSION,
  collaborationFreeze: E04_COLLABORATION_FREEZE_VERSION,
  signoff: E04_BUSINESS_AGENT_SIGNOFF_VERSION,
  freeze: E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_BUSINESS_AGENT_LAYER_VERSIONS: LockVersion =
  E04_BUSINESS_AGENT_LAYER_VERSION_LOCK;

export function isBusinessAgentLayerVersionLockIntact(): boolean {
  const lock = E04_BUSINESS_AGENT_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function businessAgentVersionLockMatchesExpected(): boolean {
  const lock = E04_BUSINESS_AGENT_LAYER_VERSION_LOCK;
  const expected = EXPECTED_BUSINESS_AGENT_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
