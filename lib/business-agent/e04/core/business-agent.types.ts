/**
 * E04-P1 — Business Agent Foundation types
 * Abstraction above E03 Agent Runtime
 */

import type { AgentCapability, AgentRole } from "../../../agent-platform/e03/core/agent.types";
import {
  E04_BUSINESS_AGENT_BASE,
  E04_BUSINESS_AGENT_FREEZE_VERSION,
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
  BUSINESS_AGENT_DOMAINS,
  BUSINESS_AGENT_LIFECYCLE_STAGES,
  BUSINESS_AGENT_STATUSES,
  BUSINESS_CAPABILITY_KINDS,
} from "./business-agent.constants";

export type BusinessAgentDomain = (typeof BUSINESS_AGENT_DOMAINS)[number];
export type BusinessAgentStatus = (typeof BUSINESS_AGENT_STATUSES)[number];
export type BusinessAgentLifecycleStage =
  (typeof BUSINESS_AGENT_LIFECYCLE_STAGES)[number];
export type BusinessCapabilityKind = (typeof BUSINESS_CAPABILITY_KINDS)[number];

export type BusinessAgentDefinition = {
  id: string;
  name: string;
  domain: BusinessAgentDomain;
  description: string;
  /** Bound E03 runtime agent id */
  runtimeAgentId: string;
  runtimeRole: AgentRole;
  runtimeCapability: AgentCapability;
  capabilityIds: string[];
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type BusinessAgentLifecycleTransition = {
  from: BusinessAgentLifecycleStage;
  to: BusinessAgentLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type BusinessAgentLifecycle = {
  current: BusinessAgentLifecycleStage;
  stages: BusinessAgentLifecycleStage[];
  transitions: BusinessAgentLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type BusinessAgentRegistryManifest = {
  platformId: typeof E04_BUSINESS_AGENT_PLATFORM_ID;
  version: typeof E04_BUSINESS_AGENT_VERSION;
  freezeVersion: typeof E04_BUSINESS_AGENT_FREEZE_VERSION;
  base: typeof E04_BUSINESS_AGENT_BASE;
  agentCount: number;
  domains: BusinessAgentDomain[];
  agents: BusinessAgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type BusinessAgentFoundationResult = {
  platformId: typeof E04_BUSINESS_AGENT_PLATFORM_ID;
  version: typeof E04_BUSINESS_AGENT_VERSION;
  freezeVersion: typeof E04_BUSINESS_AGENT_FREEZE_VERSION;
  base: typeof E04_BUSINESS_AGENT_BASE;
  registry: BusinessAgentRegistryManifest;
  lifecycle: BusinessAgentLifecycle;
  ready: boolean;
  summary: string;
};
