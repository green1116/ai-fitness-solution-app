/**
 * E08-P7 — Enterprise Network OS types
 * Network operating layer above E08 Autonomous Market Agent
 */

import type { MarketExecutionResult } from "../market/market.types";
import {
  E08_NETWORK_OS_BASE,
  E08_NETWORK_OS_FREEZE_VERSION,
  E08_NETWORK_OS_ID,
  E08_NETWORK_OS_VERSION,
  NETWORK_OS_INSTANCE_PHASES,
  NETWORK_OS_KINDS,
} from "./networkos.constants";

export type NetworkOsKind = (typeof NETWORK_OS_KINDS)[number];
export type NetworkOsInstancePhase =
  (typeof NETWORK_OS_INSTANCE_PHASES)[number];

export type NetworkOsDefinition = {
  id: string;
  name: string;
  kind: NetworkOsKind;
  mission: string;
  description: string;
  /** Ordered E08 market agent ids controlled by the OS */
  marketAgentIds: string[];
  optional: boolean;
  readOnly: true;
};

export type NetworkOsControlSlot = {
  id: string;
  order: number;
  marketAgentId: string;
  marketMission: string;
  intelligenceId: string;
  title: string;
  detail: string;
  readOnly: true;
};

export type NetworkOsControlPlan = {
  networkOsId: string;
  kind: NetworkOsKind;
  mission: string;
  slotCount: number;
  slots: NetworkOsControlSlot[];
  narrative: string;
  readOnly: true;
};

export type NetworkOsSlotResult = {
  slotId: string;
  order: number;
  marketAgentId: string;
  success: boolean;
  status: MarketExecutionResult["status"];
  posture?: string;
  confidence?: number;
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type NetworkOsExecutionResult = {
  success: boolean;
  networkOsId: string;
  kind: NetworkOsKind;
  mission: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: NetworkOsControlPlan;
  slotResults: NetworkOsSlotResult[];
  completedSlots: number;
  marketAgentIds: string[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type NetworkOsRegistryManifest = {
  networkOsId: typeof E08_NETWORK_OS_ID;
  version: typeof E08_NETWORK_OS_VERSION;
  freezeVersion: typeof E08_NETWORK_OS_FREEZE_VERSION;
  base: typeof E08_NETWORK_OS_BASE;
  definitionCount: number;
  kinds: NetworkOsKind[];
  definitions: NetworkOsDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
