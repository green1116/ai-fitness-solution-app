/**
 * E03-P1 — Enterprise Autonomous Agent Platform foundation types
 * BASE: enterprise-e03-autonomous-agent-platform-v1
 */

import {
  E03_AGENT_PLATFORM_FREEZE_VERSION,
  E03_AGENT_PLATFORM_VERSION,
} from "./agent.constants";

export type AgentPlatformId = "enterprise-e03-autonomous-agent-platform-v1";

export type AgentRole =
  | "planner"
  | "worker"
  | "critic"
  | "memory"
  | "tool"
  | "coordinator";

export type AgentCapability =
  | "plan"
  | "execute"
  | "evaluate"
  | "remember"
  | "invoke"
  | "orchestrate";

export type AgentStatus =
  | "registered"
  | "ready"
  | "running"
  | "paused"
  | "succeeded"
  | "failed"
  | "retired";

export type AgentLifecycleStage =
  | "declared"
  | "registered"
  | "activated"
  | "executing"
  | "completed";

export type AgentDefinition = {
  id: string;
  role: AgentRole;
  name: string;
  capability: AgentCapability;
  description: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type AgentInstance = {
  id: string;
  definitionId: string;
  role: AgentRole;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type AgentRegistryManifest = {
  platformId: AgentPlatformId;
  version: typeof E03_AGENT_PLATFORM_VERSION;
  freezeVersion: typeof E03_AGENT_PLATFORM_FREEZE_VERSION;
  agentCount: number;
  roles: AgentRole[];
  agents: AgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type AgentLifecycleTransition = {
  from: AgentLifecycleStage;
  to: AgentLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type AgentLifecycle = {
  current: AgentLifecycleStage;
  stages: AgentLifecycleStage[];
  transitions: AgentLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type AgentFoundationResult = {
  platformId: AgentPlatformId;
  version: typeof E03_AGENT_PLATFORM_VERSION;
  freezeVersion: typeof E03_AGENT_PLATFORM_FREEZE_VERSION;
  registry: AgentRegistryManifest;
  lifecycle: AgentLifecycle;
  ready: boolean;
  summary: string;
};
