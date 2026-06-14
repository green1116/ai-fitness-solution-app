import type { IndustryRelationshipEndpointType, IndustryRelationshipType, RegistryValidation } from "../shared/types";

export const INDUSTRY_GRAPH_QUERY_VERSION = "v31-industry-graph-query-1" as const;
export const INDUSTRY_GRAPH_QUERY_TAG = "v31-industry-graph-query-foundation" as const;

export type IndustryGraphDataMode = "industry-graph-query";

export interface GraphNode {
  nodeId: string;
  nodeType: IndustryRelationshipEndpointType;
  label: string;
  mode: IndustryGraphDataMode;
}

export interface GraphEdge {
  edgeId: string;
  sourceId: string;
  targetId: string;
  relationshipType: IndustryRelationshipType;
  mode: IndustryGraphDataMode;
}

export interface IndustryGraph {
  graphId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeCount: number;
  edgeCount: number;
  mode: IndustryGraphDataMode;
}

export interface IndustryGraphContext {
  contextId: string;
  graph: IndustryGraph;
  traversalReady: boolean;
  mode: IndustryGraphDataMode;
}

export interface GraphPath {
  pathId: string;
  sourceId: string;
  targetId: string;
  nodeIds: string[];
  edgeIds: string[];
  hopCount: number;
  found: boolean;
  mode: IndustryGraphDataMode;
}

export interface GraphTraversalResult {
  traversalId: string;
  anchorNodeId: string;
  relationships: import("../shared/types").IndustryRelationship[];
  neighborNodeIds: string[];
  hitCount: number;
  traversalReady: boolean;
}

export interface IndustryGraphQueryValidation {
  valid: boolean;
  graph: RegistryValidation;
  graphContext: RegistryValidation;
  graphTraversal: RegistryValidation;
}

export const CANONICAL_GRAPH_NODE_ID = "ind-org-supplier-life-fitness-cn" as const;

export const CANONICAL_GRAPH_PATH_QUERY = {
  sourceId: "ind-org-supplier-life-fitness-cn",
  targetId: "ind-org-buyer-sh-gym",
} as const;

export const CANONICAL_MULTI_HOP_PATH_QUERY = {
  sourceId: "ind-org-supplier-life-fitness-cn",
  targetId: "ind-org-brand-technogym",
} as const;
