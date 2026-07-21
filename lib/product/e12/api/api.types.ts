/**
 * E12-P5 — API Productization types
 */

import type {
  API_AUDIT_ACTIONS,
  API_CATALOG_STATUSES,
  API_KEY_STATUSES,
  API_MANAGER_STATUSES,
  API_PERMISSION_SCOPES,
  API_VERSIONS,
  DEVELOPER_ACCESS_STATUSES,
  E12_API_PRODUCT_BASE,
  E12_API_PRODUCT_FREEZE_VERSION,
  E12_API_PRODUCT_ID,
  E12_API_PRODUCT_VERSION,
} from "./api.constants";
import type { ProductMetadata } from "../types/product.types";

export type ApiCatalogStatus = (typeof API_CATALOG_STATUSES)[number];
export type ApiVersion = (typeof API_VERSIONS)[number];
export type ApiKeyStatus = (typeof API_KEY_STATUSES)[number];
export type DeveloperAccessStatus = (typeof DEVELOPER_ACCESS_STATUSES)[number];
export type ApiPermissionScope = (typeof API_PERMISSION_SCOPES)[number];
export type ApiAuditAction = (typeof API_AUDIT_ACTIONS)[number];
export type ApiManagerStatus = (typeof API_MANAGER_STATUSES)[number];

export type { ProductMetadata };

/** API catalog entry. */
export type ApiCatalogEntry = {
  id: string;
  productId: string;
  name: string;
  path: string;
  version: ApiVersion;
  requiredEntitlementFeatureId?: string;
  requiredScope: ApiPermissionScope;
  status: ApiCatalogStatus;
  rateLimit: number;
  metadata: ProductMetadata;
  createdAt: string;
};

export type RegisterApiCatalogInput = {
  id?: string;
  productId: string;
  name: string;
  path: string;
  version?: ApiVersion;
  requiredEntitlementFeatureId?: string;
  requiredScope?: ApiPermissionScope;
  status?: ApiCatalogStatus;
  rateLimit?: number;
  metadata?: ProductMetadata;
};

/** API key model. */
export type ApiKey = {
  id: string;
  productTenantId: string;
  developerId: string;
  keyHash: string;
  name: string;
  scopes: ApiPermissionScope[];
  status: ApiKeyStatus;
  expiresAt?: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateApiKeyInput = {
  id?: string;
  productTenantId: string;
  developerId: string;
  name: string;
  scopes?: ApiPermissionScope[];
  expiresAt?: string;
  metadata?: ProductMetadata;
};

/** Developer access record. */
export type DeveloperAccess = {
  id: string;
  userId: string;
  productTenantId: string;
  organizationId?: string;
  scopes: ApiPermissionScope[];
  status: DeveloperAccessStatus;
  metadata: ProductMetadata;
  registeredAt: string;
};

export type RegisterDeveloperAccessInput = {
  id?: string;
  userId: string;
  productTenantId: string;
  organizationId?: string;
  scopes?: ApiPermissionScope[];
  status?: DeveloperAccessStatus;
  metadata?: ProductMetadata;
};

/** Permission scope evaluation. */
export type ApiScopeEvaluationResult = {
  decision: "ALLOW" | "DENY";
  developerId: string;
  scope: ApiPermissionScope;
  reason: string;
  evaluatedAt: string;
};

/** API usage tracking record. */
export type ApiUsageRecord = {
  id: string;
  productTenantId: string;
  developerId: string;
  apiKeyId: string;
  apiCatalogEntryId: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  billingSubscriptionId?: string;
  metadata: ProductMetadata;
  recordedAt: string;
};

export type RecordApiUsageInput = {
  id?: string;
  productTenantId: string;
  developerId: string;
  apiKeyId: string;
  apiCatalogEntryId: string;
  statusCode?: number;
  latencyMs?: number;
  billingSubscriptionId?: string;
  metadata?: ProductMetadata;
};

/** API audit trail entry. */
export type ApiAuditEntry = {
  id: string;
  action: ApiAuditAction;
  actorUserId: string;
  productTenantId?: string;
  apiKeyId?: string;
  apiCatalogEntryId?: string;
  detail: string;
  metadata: ProductMetadata;
  recordedAt: string;
};

export type RecordApiAuditInput = {
  id?: string;
  action: ApiAuditAction;
  actorUserId: string;
  productTenantId?: string;
  apiKeyId?: string;
  apiCatalogEntryId?: string;
  detail: string;
  metadata?: ProductMetadata;
};

export type ApiProductRegistryManifest = {
  apiProductId: typeof E12_API_PRODUCT_ID;
  version: typeof E12_API_PRODUCT_VERSION;
  freezeVersion: typeof E12_API_PRODUCT_FREEZE_VERSION;
  base: typeof E12_API_PRODUCT_BASE;
  catalogEntryCount: number;
  apiKeyCount: number;
  developerCount: number;
  usageRecordCount: number;
  auditEntryCount: number;
};
