/**
 * E08-P2 — Multi Organization Network types
 * Network layer above E08 Enterprise Ecosystem Foundation
 */

import type { EcosystemExecutionResult } from "../runtime/ecosystem.executor";
import {
  E08_NETWORK_BASE,
  E08_NETWORK_FREEZE_VERSION,
  E08_NETWORK_RUNTIME_ID,
  E08_NETWORK_VERSION,
  NETWORK_INSTANCE_PHASES,
  NETWORK_KINDS,
} from "./network.constants";

export type NetworkKind = (typeof NETWORK_KINDS)[number];
export type NetworkInstancePhase = (typeof NETWORK_INSTANCE_PHASES)[number];

export type OrganizationNodeDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E08 ecosystem partner id */
  partnerId: string;
  /** Relationship applied when activating this organization */
  relationshipId: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type NetworkEdge = {
  from: string;
  to: string;
  readOnly: true;
};

export type NetworkDefinition = {
  id: string;
  name: string;
  kind: NetworkKind;
  description: string;
  nodes: OrganizationNodeDefinition[];
  optional: boolean;
  readOnly: true;
};

export type NetworkGraph = {
  networkId: string;
  kind: NetworkKind;
  nodes: string[];
  edges: NetworkEdge[];
  order: string[];
  acyclic: boolean;
  readOnly: true;
};

export type OrganizationNodeResult = {
  nodeId: string;
  order: number;
  partnerId: string;
  relationshipId: string;
  success: boolean;
  status: EcosystemExecutionResult["status"];
  durationMs: number;
  errorMessage?: string;
  readOnly: true;
};

export type NetworkExecutionResult = {
  success: boolean;
  networkId: string;
  kind: NetworkKind;
  instanceId: string;
  taskId: string;
  traceId: string;
  graph: NetworkGraph;
  nodeResults: OrganizationNodeResult[];
  completedNodes: number;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type NetworkRegistryManifest = {
  runtimeId: typeof E08_NETWORK_RUNTIME_ID;
  version: typeof E08_NETWORK_VERSION;
  freezeVersion: typeof E08_NETWORK_FREEZE_VERSION;
  base: typeof E08_NETWORK_BASE;
  networkCount: number;
  kinds: NetworkKind[];
  networks: NetworkDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
