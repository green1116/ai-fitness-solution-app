/**
 * Product Marketplace Surface — placement types (declaration only)
 */

import type { SURFACE_PLACEMENT_KINDS } from "../management/management.constants";

export type SurfacePlacementKind = (typeof SURFACE_PLACEMENT_KINDS)[number];
export type PlacementMetadata = Record<string, unknown>;

export type MarketplaceSurfacePlacement = {
  id: string;
  catalogId: string;
  listingId: string;
  placementKey: string;
  kind: SurfacePlacementKind;
  rank: number;
  detail: string;
  metadata: PlacementMetadata;
  createdAt: string;
};

export type RegisterSurfacePlacementInput = {
  id?: string;
  catalogId: string;
  listingId: string;
  placementKey: string;
  kind: SurfacePlacementKind;
  rank?: number;
  metadata?: PlacementMetadata;
};
