/**
 * Product Marketplace — Lifecycle types
 */

import type { MARKETPLACE_LIFECYCLE_STATES } from "../management/management.constants";

export type MarketplaceLifecycleState =
  (typeof MARKETPLACE_LIFECYCLE_STATES)[number];
export type LifecycleMetadata = Record<string, unknown>;

export type MarketplaceLifecycle = {
  id: string;
  listingId: string;
  versionId: string;
  state: MarketplaceLifecycleState;
  detail: string;
  metadata: LifecycleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type OpenMarketplaceLifecycleInput = {
  id?: string;
  listingId: string;
  versionId: string;
  metadata?: LifecycleMetadata;
};

export type TransitionMarketplaceLifecycleInput = {
  lifecycleId: string;
  state: MarketplaceLifecycleState;
};
