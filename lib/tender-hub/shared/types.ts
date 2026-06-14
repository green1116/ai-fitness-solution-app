export const TENDER_HUB_VERSION = "v36-tender-hub-1" as const;
export const TENDER_HUB_TAG = "v36-tender-hub-foundation" as const;

export type TenderHubMode = "tender-hub";

export type TenderSourceType =
  | "government"
  | "enterprise"
  | "school"
  | "hospital"
  | "factory"
  | "commercial-building"
  | "sports-center";

export type TenderHubStatus =
  | "discovered"
  | "registered"
  | "qualified"
  | "tracked"
  | "matched"
  | "proposed"
  | "submitted"
  | "awarded"
  | "closed";

export interface TenderScore {
  scoreId: string;
  tenderId: string;
  opportunityScore: number;
  budgetScore: number;
  competitionScore: number;
  matchingScore: number;
  winProbability: number;
  totalTenderScore: number;
  mode: TenderHubMode;
}

export interface TenderSource {
  sourceId: string;
  sourceType: TenderSourceType;
  sourceName: string;
  region: string;
  channel: string;
  mode: TenderHubMode;
}

export interface TenderRecord {
  tenderId: string;
  sourceId: string;
  sourceType: TenderSourceType;
  buyerOrganizationId: string;
  transactionId?: string;
  title: string;
  summary: string;
  tenderStatus: TenderHubStatus;
  score: TenderScore;
  publishedAt: string;
  metadata: Record<string, string>;
  mode: TenderHubMode;
}

export interface TenderRegistry {
  registryId: string;
  tenders: TenderRecord[];
  tenderCount: number;
  sourceBreakdown: Record<TenderSourceType, number>;
  statusBreakdown: Record<TenderHubStatus, number>;
  registryReady: boolean;
  mode: TenderHubMode;
}

export interface TenderFeed {
  feedId: string;
  items: TenderRecord[];
  feedCount: number;
  feedReady: boolean;
  mode: TenderHubMode;
}

export interface TenderDiscovery {
  discoveryId: string;
  discoveredTenders: TenderRecord[];
  sourceBreakdown: Record<TenderSourceType, number>;
  statusBreakdown: Record<TenderHubStatus, number>;
  discoveryReady: boolean;
  mode: TenderHubMode;
}

export interface TenderHub {
  hubId: string;
  sources: TenderSource[];
  registry: TenderRegistry;
  feed: TenderFeed;
  discovery: TenderDiscovery;
  hubReady: boolean;
  mode: TenderHubMode;
}

export interface TenderQuery {
  buyerOrganizationId?: string;
  sourceType?: TenderSourceType;
  tenderStatus?: TenderHubStatus;
  minTenderScore?: number;
  limit?: number;
}

export interface TenderQueryResult {
  queryId: string;
  query: TenderQuery;
  tenders: TenderRecord[];
  hitCount: number;
  hubReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderHubValidation {
  valid: boolean;
  sourceRegistry: RegistryValidation;
  tenderRegistry: RegistryValidation;
  tenderFeed: RegistryValidation;
  tenderDiscovery: RegistryValidation;
  tenderHub: RegistryValidation;
  tenderQuery: RegistryValidation;
}

export const CANONICAL_TENDER_HUB_BUYER_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_TENDER_QUERY: TenderQuery = {
  buyerOrganizationId: CANONICAL_TENDER_HUB_BUYER_ID,
  sourceType: "commercial-building",
  limit: 5,
} as const;

export const TOP_TENDER_SCORE_THRESHOLD = 78 as const;

export const OPEN_TENDER_STATUSES: TenderHubStatus[] = [
  "discovered",
  "registered",
  "qualified",
  "tracked",
  "matched",
  "proposed",
  "submitted",
];
