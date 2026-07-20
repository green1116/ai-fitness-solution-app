/**
 * E09-P6 — Global Agent Federation types
 * Agent layer above E09 Federation / Identity
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import type { FederatedIdentity } from "../federation/federation.types";
import type { GlobalIdentity } from "../identity/global.identity";
import {
  E09_AGENT_BASE,
  E09_AGENT_FREEZE_VERSION,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
  AGENT_ROLES,
  AGENT_STATUSES,
  AGENT_TASK_KINDS,
  AGENT_TASK_STATUSES,
} from "./agent.constants";

export type AgentRole = (typeof AGENT_ROLES)[number];
export type AgentStatus = (typeof AGENT_STATUSES)[number];
export type AgentTaskKind = (typeof AGENT_TASK_KINDS)[number];
export type AgentTaskStatus = (typeof AGENT_TASK_STATUSES)[number];

/** Re-exports for agent consumers */
export type { FederatedIdentity, GlobalIdentity };

export type GlobalAgent = {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  /** Optional binding to FederatedIdentity */
  federationId?: FederatedIdentity["id"];
  /** Optional binding to GlobalIdentity */
  identityId?: GlobalIdentity["id"];
  capabilities: string[];
  trustLevel: number;
  metadata: GlobalNodeMetadata;
};

export type RegisterAgentInput = {
  id: string;
  name: string;
  role: AgentRole;
  status?: AgentStatus;
  federationId?: FederatedIdentity["id"];
  identityId?: GlobalIdentity["id"];
  capabilities?: string[];
  trustLevel?: number;
  metadata?: GlobalNodeMetadata;
};

export type AgentTask = {
  id: string;
  kind: AgentTaskKind;
  title: string;
  status: AgentTaskStatus;
  /** Assigned agent ids */
  agentIds: string[];
  payload: GlobalNodeMetadata;
  result?: GlobalNodeMetadata;
  createdAt: string;
  completedAt?: string;
};

export type DispatchTaskInput = {
  id?: string;
  kind: AgentTaskKind;
  title: string;
  agentIds: string[];
  payload?: GlobalNodeMetadata;
};

export type CoordinationPlan = {
  id: string;
  agentIds: string[];
  leadAgentId: string;
  roles: Readonly<Record<string, AgentRole>>;
  strategy: "PARALLEL" | "SEQUENTIAL" | "LEAD_FOLLOW";
  createdAt: string;
};

export type AgentRegistryManifest = {
  agentId: typeof E09_AGENT_ID;
  version: typeof E09_AGENT_VERSION;
  freezeVersion: typeof E09_AGENT_FREEZE_VERSION;
  base: typeof E09_AGENT_BASE;
  agentCount: number;
  agents: GlobalAgent[];
};
