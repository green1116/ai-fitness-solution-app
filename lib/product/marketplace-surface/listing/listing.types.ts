/**
 * Product Marketplace Surface — listing types (soft appKeyRef only)
 */

import type { SURFACE_LISTING_STATUSES } from "../management/management.constants";

export type SurfaceListingStatus = (typeof SURFACE_LISTING_STATUSES)[number];
export type ListingMetadata = Record<string, unknown>;

export type MarketplaceSurfaceListing = {
  id: string;
  catalogId: string;
  listingKey: string;
  title: string;
  appKeyRef: string;
  status: SurfaceListingStatus;
  detail: string;
  metadata: ListingMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterSurfaceListingInput = {
  id?: string;
  catalogId: string;
  listingKey: string;
  title: string;
  appKeyRef: string;
  metadata?: ListingMetadata;
};

export type UpdateSurfaceListingStatusInput = {
  listingId: string;
  status: SurfaceListingStatus;
};
