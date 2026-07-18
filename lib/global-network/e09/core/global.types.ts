/**
 * E09-P1 — Global Network Foundation types
 * Global enterprise network foundation above E08 Ecosystem Platform
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
  GLOBAL_EDGE_RELATIONS,
  GLOBAL_LIFECYCLE_STAGES,
  GLOBAL_NODE_STATUSES,
  GLOBAL_NODE_TYPES,
} from "./global.constants";

export type GlobalNodeType = (typeof GLOBAL_NODE_TYPES)[number];
export type GlobalNodeStatus = (typeof GLOBAL_NODE_STATUSES)[number];
export type GlobalEdgeRelation = (typeof GLOBAL_EDGE_RELATIONS)[number];
export type GlobalLifecycleStage = (typeof GLOBAL_LIFECYCLE_STAGES)[number];

export type GlobalNodeMetadata = Record<string, unknown>;

export type GlobalNode = {
  id: string;
  type: GlobalNodeType;
  status: GlobalNodeStatus;
  metadata: GlobalNodeMetadata;
};

export type NetworkEdge = {
  source: string;
  target: string;
  relation: GlobalEdgeRelation;
  weight: number;
};

export type GlobalLifecycleTransition = {
  from: GlobalLifecycleStage;
  to: GlobalLifecycleStage;
  at: string;
  note?: string;
};

export type GlobalNodeLifecycle = {
  nodeId: string;
  current: GlobalLifecycleStage;
  stages: GlobalLifecycleStage[];
  transitions: GlobalLifecycleTransition[];
};

export type GlobalRegistryManifest = {
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  version: typeof E09_GLOBAL_NETWORK_VERSION;
  freezeVersion: typeof E09_GLOBAL_NETWORK_FREEZE_VERSION;
  base: typeof E09_GLOBAL_NETWORK_BASE;
  nodeCount: number;
  edgeCount: number;
  nodes: GlobalNode[];
  edges: NetworkEdge[];
};

export type GlobalFoundationResult = {
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  version: typeof E09_GLOBAL_NETWORK_VERSION;
  freezeVersion: typeof E09_GLOBAL_NETWORK_FREEZE_VERSION;
  base: typeof E09_GLOBAL_NETWORK_BASE;
  registry: GlobalRegistryManifest;
  ready: boolean;
  summary: string;
};

export type CreateGlobalNodeInput = {
  id: string;
  type: GlobalNodeType;
  metadata?: GlobalNodeMetadata;
};
