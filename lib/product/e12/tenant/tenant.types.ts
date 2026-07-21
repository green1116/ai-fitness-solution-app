/**
 * E12-P2 — SaaS Tenant Product types
 */

import type {
  ACCESS_DECISIONS,
  E12_TENANT_PRODUCT_BASE,
  E12_TENANT_PRODUCT_FREEZE_VERSION,
  E12_TENANT_PRODUCT_ID,
  E12_TENANT_PRODUCT_VERSION,
  ENTITLEMENT_STATUSES,
  PRODUCT_TENANT_STATUSES,
  SUBSCRIPTION_STATUSES,
  TENANT_PRODUCT_MANAGER_STATUSES,
  WORKSPACE_STATUSES,
} from "./tenant.constants";
import type { ProductMetadata } from "../types/product.types";

export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
export type ProductTenantStatus = (typeof PRODUCT_TENANT_STATUSES)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];
export type AccessDecision = (typeof ACCESS_DECISIONS)[number];
export type TenantProductManagerStatus =
  (typeof TENANT_PRODUCT_MANAGER_STATUSES)[number];

export type { ProductMetadata };

/** SaaS workspace model. */
export type ProductWorkspace = {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  productTenantId?: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateWorkspaceInput = {
  id?: string;
  name: string;
  slug: string;
  status?: WorkspaceStatus;
  productTenantId?: string;
  metadata?: ProductMetadata;
};

/** Product tenant instance. */
export type ProductTenant = {
  id: string;
  name: string;
  productId: string;
  workspaceId: string;
  status: ProductTenantStatus;
  organizationId?: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type RegisterProductTenantInput = {
  id?: string;
  name: string;
  productId: string;
  workspaceId: string;
  status?: ProductTenantStatus;
  organizationId?: string;
  metadata?: ProductMetadata;
};

/** Subscription binding to edition / package. */
export type SubscriptionBinding = {
  id: string;
  productTenantId: string;
  productId: string;
  editionId: string;
  packageId?: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
  metadata: ProductMetadata;
};

export type BindSubscriptionInput = {
  id?: string;
  productTenantId: string;
  productId: string;
  editionId: string;
  packageId?: string;
  status?: SubscriptionStatus;
  expiresAt?: string;
  metadata?: ProductMetadata;
};

/** Feature entitlement for a tenant. */
export type FeatureEntitlement = {
  id: string;
  productTenantId: string;
  featureId: string;
  status: EntitlementStatus;
  source: "EDITION" | "PACKAGE" | "MANUAL";
  subscriptionId?: string;
  metadata: ProductMetadata;
  grantedAt: string;
};

export type GrantEntitlementInput = {
  id?: string;
  productTenantId: string;
  featureId: string;
  status?: EntitlementStatus;
  source?: FeatureEntitlement["source"];
  subscriptionId?: string;
  metadata?: ProductMetadata;
};

/** Capability access evaluation result. */
export type CapabilityAccessResult = {
  decision: AccessDecision;
  productTenantId: string;
  capabilityRef: string;
  featureId?: string;
  reason: string;
  evaluatedAt: string;
};

export type TenantProductRegistryManifest = {
  tenantProductId: typeof E12_TENANT_PRODUCT_ID;
  version: typeof E12_TENANT_PRODUCT_VERSION;
  freezeVersion: typeof E12_TENANT_PRODUCT_FREEZE_VERSION;
  base: typeof E12_TENANT_PRODUCT_BASE;
  workspaceCount: number;
  tenantCount: number;
  subscriptionCount: number;
  entitlementCount: number;
};
