/**
 * Product Marketplace Surface — visibility types
 */

import type { SURFACE_VISIBILITY_MODES } from "../management/management.constants";

export type SurfaceVisibilityMode =
  (typeof SURFACE_VISIBILITY_MODES)[number];
export type VisibilityMetadata = Record<string, unknown>;

export type MarketplaceSurfaceVisibility = {
  id: string;
  catalogId: string;
  listingId: string;
  visibilityKey: string;
  mode: SurfaceVisibilityMode;
  detail: string;
  metadata: VisibilityMetadata;
  createdAt: string;
};

export type AttachSurfaceVisibilityInput = {
  id?: string;
  catalogId: string;
  listingId: string;
  visibilityKey: string;
  mode: SurfaceVisibilityMode;
  metadata?: VisibilityMetadata;
};
