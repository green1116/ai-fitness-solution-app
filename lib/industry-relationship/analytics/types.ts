import type { IndustryRelationshipType, RegistryValidation } from "../shared/types";

export const INDUSTRY_ANALYTICS_VERSION = "v31-industry-analytics-1" as const;
export const INDUSTRY_ANALYTICS_TAG = "v31-industry-analytics-foundation" as const;

export type IndustryNetworkAnalyticsMode = "industry-network-analytics";

export interface NodeDegreeMetric {
  nodeId: string;
  label: string;
  inboundDegree: number;
  outboundDegree: number;
  totalDegree: number;
  mode: IndustryNetworkAnalyticsMode;
}

export interface ConnectedNodeRank {
  nodeId: string;
  label: string;
  totalDegree: number;
  rank: number;
  mode: IndustryNetworkAnalyticsMode;
}

export interface NetworkMetrics {
  nodeCount: number;
  edgeCount: number;
  relationshipDensity: number;
  averageDegree: number;
  relationshipTypeBreakdown: Record<IndustryRelationshipType, number>;
  categoryCoverage: number;
  organizationCoverage: number;
  mode: IndustryNetworkAnalyticsMode;
}

export interface NetworkSnapshot {
  snapshotId: string;
  capturedAt: string;
  graphId: string;
  metrics: NetworkMetrics;
  nodeDegrees: NodeDegreeMetric[];
  topConnectedNodes: ConnectedNodeRank[];
  mode: IndustryNetworkAnalyticsMode;
}

export interface IndustryAnalyticsContext {
  contextId: string;
  snapshot: NetworkSnapshot;
  metrics: NetworkMetrics;
  analyticsReady: boolean;
  mode: IndustryNetworkAnalyticsMode;
}

export interface AnalyticsQuery {
  nodeId?: string;
  topLimit?: number;
  relationshipType?: IndustryRelationshipType;
}

export interface AnalyticsQueryResult {
  queryId: string;
  query: AnalyticsQuery;
  nodeDegree?: NodeDegreeMetric;
  topConnectedNodes?: ConnectedNodeRank[];
  relationshipTypeBreakdown?: Record<IndustryRelationshipType, number>;
  metrics?: NetworkMetrics;
  analyticsReady: boolean;
}

export interface IndustryNetworkAnalyticsValidation {
  valid: boolean;
  networkMetrics: RegistryValidation;
  networkSnapshot: RegistryValidation;
  analyticsContext: RegistryValidation;
  analyticsQuery: RegistryValidation;
}

export const CANONICAL_ANALYTICS_NODE_ID = "ind-org-supplier-life-fitness-cn" as const;

export const CANONICAL_ANALYTICS_QUERY: AnalyticsQuery = {
  nodeId: CANONICAL_ANALYTICS_NODE_ID,
  topLimit: 5,
} as const;
