export const INDUSTRY_DATA_NETWORK_VERSION = "v32-industry-data-network-1" as const;
export const INDUSTRY_DATA_NETWORK_TAG = "v32-industry-data-network-foundation" as const;

export type IndustryDataNetworkMode = "industry-data-network";

export type IndustryDataEntityStatus = "active" | "inactive" | "draft" | "archived";

export type IndustryDataSubjectType = "organization" | "directory-entry" | "relationship";

export type IndustrySignalType =
  | "SUPPLY_ACTIVITY"
  | "TENDER_INTEREST"
  | "NETWORK_CENTRALITY"
  | "CATEGORY_SHIFT"
  | "RELATIONSHIP_GROWTH";

export type IndustryEventType =
  | "RELATIONSHIP_ESTABLISHED"
  | "BID_SUBMITTED"
  | "SUPPLIER_LINKED"
  | "DIRECTORY_PUBLISHED"
  | "RECOMMENDATION_MATCH";

export type IndustrySignalSeverity = "low" | "medium" | "high";

export interface IndustrySignal {
  signalId: string;
  signalType: IndustrySignalType;
  subjectId: string;
  subjectType: IndustryDataSubjectType;
  severity: IndustrySignalSeverity;
  observedAt: string;
  status: IndustryDataEntityStatus;
  metadata: Record<string, string>;
  mode: IndustryDataNetworkMode;
}

export interface IndustryEvent {
  eventId: string;
  eventType: IndustryEventType;
  subjectId: string;
  subjectType: IndustryDataSubjectType;
  occurredAt: string;
  status: IndustryDataEntityStatus;
  metadata: Record<string, string>;
  mode: IndustryDataNetworkMode;
}

export interface IndustryObservation {
  observationId: string;
  subjectId: string;
  subjectType: IndustryDataSubjectType;
  signalIds: string[];
  eventIds: string[];
  summary: string;
  observedAt: string;
  status: IndustryDataEntityStatus;
  metadata: Record<string, string>;
  mode: IndustryDataNetworkMode;
}

export interface IndustryDataContext {
  contextId: string;
  signals: IndustrySignal[];
  events: IndustryEvent[];
  observations: IndustryObservation[];
  signalCount: number;
  eventCount: number;
  observationCount: number;
  dataReady: boolean;
  mode: IndustryDataNetworkMode;
}

export interface DataQuery {
  subjectId?: string;
  subjectType?: IndustryDataSubjectType;
  signalType?: IndustrySignalType;
  eventType?: IndustryEventType;
  severity?: IndustrySignalSeverity;
  keyword?: string;
}

export interface DataQueryResult {
  queryId: string;
  query: DataQuery;
  signals: IndustrySignal[];
  events: IndustryEvent[];
  observations: IndustryObservation[];
  hitCount: number;
  dataReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryDataNetworkValidation {
  valid: boolean;
  signalRegistry: RegistryValidation;
  eventRegistry: RegistryValidation;
  observationRegistry: RegistryValidation;
  dataContext: RegistryValidation;
  dataQuery: RegistryValidation;
}

export const CANONICAL_DATA_SUBJECT_ID = "ind-org-supplier-life-fitness-cn" as const;

export const CANONICAL_DATA_QUERY: DataQuery = {
  subjectId: CANONICAL_DATA_SUBJECT_ID,
  signalType: "SUPPLY_ACTIVITY",
} as const;
