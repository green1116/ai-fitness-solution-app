/**
 * Product Marketplace — Listing registry types
 */

import type { MARKETPLACE_LISTING_KINDS } from "../management/management.constants";

export type MarketplaceListingKind =
  (typeof MARKETPLACE_LISTING_KINDS)[number];
export type ListingMetadata = Record<string, unknown>;

export type MarketplaceListing = {
  id: string;
  listingKey: string;
  name: string;
  kind: MarketplaceListingKind;
  detail: string;
  metadata: ListingMetadata;
  createdAt: string;
};

export type RegisterMarketplaceListingInput = {
  id?: string;
  listingKey: string;
  name: string;
  kind: MarketplaceListingKind;
  metadata?: ListingMetadata;
};
