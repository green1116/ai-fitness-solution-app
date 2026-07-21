/**
 * E12-P1 — Enterprise Product Foundation types
 */

import type {
  CAPABILITY_PACKAGE_KINDS,
  E12_PRODUCT_BASE,
  E12_PRODUCT_FREEZE_VERSION,
  E12_PRODUCT_ID,
  E12_PRODUCT_VERSION,
  FEATURE_AVAILABILITY,
  FEATURE_CATEGORIES,
  PRODUCT_EDITION_KINDS,
  PRODUCT_MANAGER_STATUSES,
  PRODUCT_STATUSES,
} from "../core/product.constants";

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type ProductEditionKind = (typeof PRODUCT_EDITION_KINDS)[number];
export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];
export type FeatureAvailability = (typeof FEATURE_AVAILABILITY)[number];
export type CapabilityPackageKind = (typeof CAPABILITY_PACKAGE_KINDS)[number];
export type ProductManagerStatus = (typeof PRODUCT_MANAGER_STATUSES)[number];

export type ProductMetadata = Record<string, unknown>;

/** Product identity model. */
export type ProductIdentity = {
  id: string;
  name: string;
  sku: string;
  status: ProductStatus;
  version: string;
  platformBaseline: string;
  description?: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type RegisterProductIdentityInput = {
  id?: string;
  name: string;
  sku: string;
  status?: ProductStatus;
  version?: string;
  platformBaseline?: string;
  description?: string;
  metadata?: ProductMetadata;
};

/** Edition model. */
export type ProductEdition = {
  id: string;
  productId: string;
  kind: ProductEditionKind;
  name: string;
  featureIds: string[];
  maxTenants?: number;
  maxRuntimes?: number;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateProductEditionInput = {
  id?: string;
  productId: string;
  kind: ProductEditionKind;
  name: string;
  featureIds?: string[];
  maxTenants?: number;
  maxRuntimes?: number;
  metadata?: ProductMetadata;
};

/** Feature catalog entry. */
export type ProductFeature = {
  id: string;
  key: string;
  name: string;
  category: FeatureCategory;
  availability: FeatureAvailability;
  /** Platform v1 capability reference when packaged from enterprise stack. */
  capabilityRef?: string;
  description?: string;
  metadata: ProductMetadata;
};

export type RegisterProductFeatureInput = {
  id?: string;
  key: string;
  name: string;
  category: FeatureCategory;
  availability?: FeatureAvailability;
  capabilityRef?: string;
  description?: string;
  metadata?: ProductMetadata;
};

/** Capability packaging — bundles features for editions. */
export type CapabilityPackage = {
  id: string;
  productId: string;
  kind: CapabilityPackageKind;
  name: string;
  featureIds: string[];
  capabilityRefs: string[];
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateCapabilityPackageInput = {
  id?: string;
  productId: string;
  kind?: CapabilityPackageKind;
  name: string;
  featureIds?: string[];
  capabilityRefs?: string[];
  metadata?: ProductMetadata;
};

export type ProductRegistryManifest = {
  productId: typeof E12_PRODUCT_ID;
  version: typeof E12_PRODUCT_VERSION;
  freezeVersion: typeof E12_PRODUCT_FREEZE_VERSION;
  base: typeof E12_PRODUCT_BASE;
  identityCount: number;
  editionCount: number;
  featureCount: number;
  packageCount: number;
};

export type ProductFoundationManifest = {
  productId: typeof E12_PRODUCT_ID;
  version: typeof E12_PRODUCT_VERSION;
  freezeVersion: typeof E12_PRODUCT_FREEZE_VERSION;
  base: typeof E12_PRODUCT_BASE;
  platformBaseline: string;
  platformAligned: boolean;
  identities: ProductIdentity[];
  editions: ProductEdition[];
  features: ProductFeature[];
  packages: CapabilityPackage[];
  ready: boolean;
  summary: string;
};
