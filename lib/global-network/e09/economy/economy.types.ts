/**
 * E09-P5 — Autonomous Network Economy types
 * Economy layer above E09 Federation / Market / Core
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import type { Market } from "../market/market.types";
import type { Region } from "../regional/regional.types";
import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_FREEZE_VERSION,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
  ECONOMIC_NODE_STATUSES,
  ECONOMIC_NODE_TYPES,
  VALUE_FLOW_KINDS,
  VALUE_FLOW_STATUSES,
} from "./economy.constants";

export type EconomicNodeType = (typeof ECONOMIC_NODE_TYPES)[number];
export type EconomicNodeStatus = (typeof ECONOMIC_NODE_STATUSES)[number];
export type ValueFlowKind = (typeof VALUE_FLOW_KINDS)[number];
export type ValueFlowStatus = (typeof VALUE_FLOW_STATUSES)[number];

/** Re-exports for economy consumers */
export type { Market, Region };

export type EconomicNode = {
  id: string;
  name: string;
  type: EconomicNodeType;
  status: EconomicNodeStatus;
  /** Current value balance */
  balance: number;
  /** Optional binding to e09 market */
  marketId?: Market["id"];
  /** Optional binding to e09 region */
  regionId?: Region["id"];
  /** Optional binding to global network node */
  globalNodeId?: string;
  metadata: GlobalNodeMetadata;
};

export type RegisterEconomicNodeInput = {
  id: string;
  name: string;
  type: EconomicNodeType;
  status?: EconomicNodeStatus;
  balance?: number;
  marketId?: Market["id"];
  regionId?: Region["id"];
  globalNodeId?: string;
  metadata?: GlobalNodeMetadata;
};

export type ValueFlow = {
  id: string;
  kind: ValueFlowKind;
  sourceId: EconomicNode["id"];
  targetId: EconomicNode["id"];
  amount: number;
  status: ValueFlowStatus;
  /** Intermediate hop node ids (ordered) */
  hops: string[];
  settledAt?: string;
  metadata: GlobalNodeMetadata;
};

export type CreateValueFlowInput = {
  id?: string;
  kind: ValueFlowKind;
  sourceId: EconomicNode["id"];
  targetId: EconomicNode["id"];
  amount: number;
  metadata?: GlobalNodeMetadata;
};

export type FlowLink = {
  source: string;
  target: string;
  flowId: string;
  capacity: number;
};

export type FlowPath = {
  nodes: string[];
  links: FlowLink[];
  /** Min capacity along the path */
  minCapacity: number;
  flowId?: string;
};

export type EconomyRegistryManifest = {
  economyId: typeof E09_ECONOMY_ID;
  version: typeof E09_ECONOMY_VERSION;
  freezeVersion: typeof E09_ECONOMY_FREEZE_VERSION;
  base: typeof E09_ECONOMY_BASE;
  nodeCount: number;
  nodes: EconomicNode[];
};
