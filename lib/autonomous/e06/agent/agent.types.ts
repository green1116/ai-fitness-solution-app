/**
 * E06-P7 — Autonomous Enterprise Agent types
 * Enterprise agent layer above E06 Enterprise Digital Twin
 */

import type { TwinSimulationResult } from "../digital-twin/twin.types";
import {
  AGENT_DIRECTIVE_KINDS,
  AGENT_MISSIONS,
  AGENT_POSTURES,
  E06_AGENT_BASE,
  E06_AGENT_FREEZE_VERSION,
  E06_AGENT_ID,
  E06_AGENT_VERSION,
} from "./agent.constants";

export type AgentMission = (typeof AGENT_MISSIONS)[number];
export type AgentPosture = (typeof AGENT_POSTURES)[number];
export type AgentDirectiveKind = (typeof AGENT_DIRECTIVE_KINDS)[number];

export type EnterpriseAgentDefinition = {
  id: string;
  name: string;
  mission: AgentMission;
  description: string;
  /** Bound E06 digital twin id */
  twinId: string;
  preferredPosture: AgentPosture;
  /** Twin score (0-100) below which the agent turns corrective */
  correctiveBelow: number;
  optional: boolean;
  readOnly: true;
};

export type AgentDirective = {
  id: string;
  kind: AgentDirectiveKind;
  title: string;
  detail: string;
  order: number;
  readOnly: true;
};

export type AgentDecision = {
  agentId: string;
  twinId: string;
  mission: AgentMission;
  posture: AgentPosture;
  directives: AgentDirective[];
  rationale: string;
  confidence: number;
  readOnly: true;
};

export type AgentExecutionResult = {
  success: boolean;
  agentId: string;
  name: string;
  mission: AgentMission;
  twinId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  twin?: TwinSimulationResult;
  decision?: AgentDecision;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type EnterpriseAgentRegistryManifest = {
  agentPlatformId: typeof E06_AGENT_ID;
  version: typeof E06_AGENT_VERSION;
  freezeVersion: typeof E06_AGENT_FREEZE_VERSION;
  base: typeof E06_AGENT_BASE;
  agentCount: number;
  missions: AgentMission[];
  agents: EnterpriseAgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
