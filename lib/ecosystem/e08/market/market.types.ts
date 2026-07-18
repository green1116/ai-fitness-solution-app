/**
 * E08-P6 — Autonomous Market Agent types
 * Market agent layer above E08 Ecosystem Intelligence
 */

import type { IntelligenceRunResult } from "../intelligence/intelligence.types";
import {
  E08_MARKET_AGENT_ID,
  E08_MARKET_BASE,
  E08_MARKET_FREEZE_VERSION,
  E08_MARKET_VERSION,
  MARKET_DIRECTIVE_KINDS,
  MARKET_MISSIONS,
  MARKET_POSTURES,
} from "./market.constants";

export type MarketMission = (typeof MARKET_MISSIONS)[number];
export type MarketPosture = (typeof MARKET_POSTURES)[number];
export type MarketDirectiveKind = (typeof MARKET_DIRECTIVE_KINDS)[number];

export type MarketAgentDefinition = {
  id: string;
  name: string;
  mission: MarketMission;
  description: string;
  /** Bound E08 ecosystem intelligence id */
  intelligenceId: string;
  preferredPosture: MarketPosture;
  /** Intelligence score (0-100) below which the agent turns corrective */
  correctiveBelow: number;
  optional: boolean;
  readOnly: true;
};

export type MarketDirective = {
  id: string;
  kind: MarketDirectiveKind;
  title: string;
  detail: string;
  order: number;
  readOnly: true;
};

export type MarketDecision = {
  agentId: string;
  intelligenceId: string;
  mission: MarketMission;
  posture: MarketPosture;
  directives: MarketDirective[];
  rationale: string;
  confidence: number;
  readOnly: true;
};

export type MarketExecutionResult = {
  success: boolean;
  agentId: string;
  name: string;
  mission: MarketMission;
  intelligenceId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  intelligence?: IntelligenceRunResult;
  decision?: MarketDecision;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type MarketAgentRegistryManifest = {
  agentPlatformId: typeof E08_MARKET_AGENT_ID;
  version: typeof E08_MARKET_VERSION;
  freezeVersion: typeof E08_MARKET_FREEZE_VERSION;
  base: typeof E08_MARKET_BASE;
  agentCount: number;
  missions: MarketMission[];
  agents: MarketAgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
