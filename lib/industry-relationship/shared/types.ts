export const INDUSTRY_RELATIONSHIP_VERSION = "v31-industry-relationship-1" as const;
export const INDUSTRY_RELATIONSHIP_TAG = "v31-industry-relationship-foundation" as const;

export type IndustryRelationshipDataMode = "industry-relationship";

export type IndustryRelationshipType =
  | "SUPPLIES"
  | "DISTRIBUTES"
  | "REPRESENTS"
  | "CONSULTS"
  | "OWNS"
  | "PARTNERS_WITH"
  | "BID_ON"
  | "SERVES";

export type IndustryRelationshipStatus = "active" | "inactive" | "draft" | "suspended" | "archived";

export type IndustryRelationshipEndpointType = "organization" | "directory-entry";

export interface IndustryRelationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  sourceType: IndustryRelationshipEndpointType;
  targetType: IndustryRelationshipEndpointType;
  relationshipType: IndustryRelationshipType;
  status: IndustryRelationshipStatus;
  createdAt: string;
  metadata: Record<string, string>;
  mode: IndustryRelationshipDataMode;
}

export interface IndustryRelationshipArchiveEntry {
  archiveId: string;
  relationship: IndustryRelationship;
  archivedAt: string;
  reason: string;
  mode: IndustryRelationshipDataMode;
}

export interface IndustryRelationshipContext {
  contextId: string;
  relationships: IndustryRelationship[];
  archivedRelationships: IndustryRelationship[];
  typeBreakdown: Record<IndustryRelationshipType, number>;
  totalActive: number;
  totalArchived: number;
  mode: IndustryRelationshipDataMode;
}

export interface RelationshipQuery {
  sourceId?: string;
  targetId?: string;
  relationshipType?: IndustryRelationshipType;
  status?: IndustryRelationshipStatus;
}

export interface RelationshipQueryResult {
  queryId: string;
  query: RelationshipQuery;
  relationships: IndustryRelationship[];
  hitCount: number;
  relationshipReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryRelationshipValidation {
  valid: boolean;
  relationshipRegistry: RegistryValidation;
  relationshipContext: RegistryValidation;
  relationshipQuery: RegistryValidation;
  relationshipArchive: RegistryValidation;
}

export const CANONICAL_RELATIONSHIP_ID = "ind-rel-supplies-lf-sh" as const;

export const CANONICAL_RELATIONSHIP_QUERY: RelationshipQuery = {
  sourceId: "ind-org-supplier-life-fitness-cn",
  relationshipType: "SUPPLIES",
  status: "active",
} as const;
