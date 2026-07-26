/**
 * Product Marketplace — Policy types
 */

import type { MARKETPLACE_POLICY_MODES } from "../management/management.constants";

export type MarketplacePolicyMode =
  (typeof MARKETPLACE_POLICY_MODES)[number];
export type PolicyMetadata = Record<string, unknown>;

export type MarketplacePolicy = {
  id: string;
  listingId: string;
  mode: MarketplacePolicyMode;
  requireVersion: boolean;
  detail: string;
  metadata: PolicyMetadata;
  createdAt: string;
};

export type AttachMarketplacePolicyInput = {
  id?: string;
  listingId: string;
  mode: MarketplacePolicyMode;
  requireVersion: boolean;
  metadata?: PolicyMetadata;
};
