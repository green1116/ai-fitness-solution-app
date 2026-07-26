/**
 * Product Marketplace — Definition types (catalog capability only)
 */

export type DefinitionMetadata = Record<string, unknown>;

export type MarketplaceDefinition = {
  id: string;
  listingId: string;
  capabilityKey: string;
  surfaceRef: string;
  summary: string;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
};

export type DefineMarketplaceDefinitionInput = {
  id?: string;
  listingId: string;
  capabilityKey: string;
  surfaceRef: string;
  summary: string;
  metadata?: DefinitionMetadata;
};
