/**
 * Product Pricing — Catalog types
 */

import type { PRICING_CATALOG_STATUSES } from "../management/management.constants";

export type PricingCatalogStatus = (typeof PRICING_CATALOG_STATUSES)[number];
export type CatalogMetadata = Record<string, unknown>;

export type PricingCatalog = {
  id: string;
  code: string;
  name: string;
  status: PricingCatalogStatus;
  detail: string;
  metadata: CatalogMetadata;
  createdAt: string;
  publishedAt?: string;
};

export type CreateCatalogInput = {
  id?: string;
  code: string;
  name: string;
  metadata?: CatalogMetadata;
};

export type PublishCatalogInput = {
  catalogId: string;
};

export type ArchiveCatalogInput = {
  catalogId: string;
};
