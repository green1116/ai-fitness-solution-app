/**
 * Commercialization P2 — Product types
 */

import type { PRODUCT_STATUSES } from "../tier/tier.constants";

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductMetadata = Record<string, unknown>;

export type CommercialProduct = {
  id: string;
  name: string;
  sku: string;
  status: ProductStatus;
  category: string;
  featureIds: string[];
  detail: string;
  metadata: ProductMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterProductInput = {
  id?: string;
  name: string;
  sku: string;
  status?: ProductStatus;
  category?: string;
  featureIds?: string[];
  metadata?: ProductMetadata;
};

export type ProductCatalogEntry = {
  id: string;
  productId: string;
  title: string;
  summary: string;
  featured: boolean;
  rank: number;
  detail: string;
  catalogedAt: string;
};

export type CatalogProductInput = {
  id?: string;
  productId: string;
  title?: string;
  summary?: string;
  featured?: boolean;
  rank?: number;
};
