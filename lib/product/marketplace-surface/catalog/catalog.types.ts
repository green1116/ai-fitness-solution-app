/**
 * Product Marketplace Surface — catalog types
 */

import type {
  SURFACE_CATALOG_KINDS,
  SURFACE_CATALOG_STATUSES,
} from "../management/management.constants";

export type SurfaceCatalogKind = (typeof SURFACE_CATALOG_KINDS)[number];
export type SurfaceCatalogStatus = (typeof SURFACE_CATALOG_STATUSES)[number];
export type CatalogMetadata = Record<string, unknown>;

export type MarketplaceSurfaceCatalog = {
  id: string;
  catalogKey: string;
  name: string;
  kind: SurfaceCatalogKind;
  status: SurfaceCatalogStatus;
  detail: string;
  metadata: CatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterSurfaceCatalogInput = {
  id?: string;
  catalogKey: string;
  name: string;
  kind: SurfaceCatalogKind;
  metadata?: CatalogMetadata;
};

export type UpdateSurfaceCatalogStatusInput = {
  catalogId: string;
  status: SurfaceCatalogStatus;
};
