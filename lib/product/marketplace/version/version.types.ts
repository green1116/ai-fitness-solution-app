/**
 * Product Marketplace — Version types
 */

export type VersionMetadata = Record<string, unknown>;

export type MarketplaceVersion = {
  id: string;
  listingId: string;
  versionTag: string;
  definitionIds: string[];
  detail: string;
  metadata: VersionMetadata;
  createdAt: string;
};

export type RegisterMarketplaceVersionInput = {
  id?: string;
  listingId: string;
  versionTag: string;
  definitionIds: string[];
  metadata?: VersionMetadata;
};
