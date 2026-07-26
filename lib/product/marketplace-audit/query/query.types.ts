/**
 * Product Marketplace Audit — Query types
 */

export type QueryMetadata = Record<string, unknown>;

export type MarketplaceAuditQuery = {
  id: string;
  queryKey: string;
  category?: string;
  subjectKey?: string;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  createdAt: string;
};

export type RunMarketplaceAuditQueryInput = {
  id?: string;
  queryKey: string;
  category?: string;
  subjectKey?: string;
  metadata?: QueryMetadata;
};
