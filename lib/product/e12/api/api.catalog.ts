/**
 * E12-P5 — API Catalog Model
 * Integrates entitlement for feature-gated APIs
 */

import { getProductIdentity } from "../identity/product.identity";
import { hasFeatureEntitlement } from "../tenant/tenant.entitlement";
import {
  API_CATALOG_STATUSES,
  API_PERMISSION_SCOPES,
  API_VERSIONS,
} from "./api.constants";
import type {
  ApiCatalogEntry,
  ApiCatalogStatus,
  RegisterApiCatalogInput,
} from "./api.types";

const catalogEntries = new Map<string, ApiCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: ApiCatalogEntry): ApiCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerApiCatalogEntry(
  input: RegisterApiCatalogInput,
): ApiCatalogEntry {
  const productId = input.productId.trim();
  const name = input.name.trim();
  const apiPath = input.path.trim();
  if (!name) throw new Error("api.name is required");
  if (!apiPath) throw new Error("api.path is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const status = input.status ?? "ACTIVE";
  if (!(API_CATALOG_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid api catalog status: ${status}`);
  }

  const version = input.version ?? "v1";
  if (!(API_VERSIONS as readonly string[]).includes(version)) {
    throw new Error(`invalid api version: ${version}`);
  }

  const requiredScope = input.requiredScope ?? "api:read";
  if (!(API_PERMISSION_SCOPES as readonly string[]).includes(requiredScope)) {
    throw new Error(`invalid api scope: ${requiredScope}`);
  }

  const id = input.id?.trim() || createId("apicat");
  if (catalogEntries.has(id)) {
    throw new Error(`api catalog entry already exists: ${id}`);
  }

  const entry: ApiCatalogEntry = {
    id,
    productId,
    name,
    path: apiPath,
    version,
    requiredEntitlementFeatureId:
      input.requiredEntitlementFeatureId?.trim() || undefined,
    requiredScope,
    status,
    rateLimit: input.rateLimit ?? 1000,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  catalogEntries.set(id, entry);
  return cloneEntry(entry);
}

export function getApiCatalogEntry(id: string): ApiCatalogEntry | undefined {
  const entry = catalogEntries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listApiCatalogEntries(filter?: {
  productId?: string;
  status?: ApiCatalogStatus;
  version?: string;
}): ApiCatalogEntry[] {
  let result = [...catalogEntries.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((e) => e.productId === pid);
  }
  if (filter?.status) result = result.filter((e) => e.status === filter.status);
  if (filter?.version)
    result = result.filter((e) => e.version === filter.version);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function isApiEntitlementGranted(
  productTenantId: string,
  apiCatalogEntryId: string,
): boolean {
  const entry = getApiCatalogEntry(apiCatalogEntryId);
  if (!entry) return false;
  if (!entry.requiredEntitlementFeatureId) return true;
  return hasFeatureEntitlement(productTenantId, entry.requiredEntitlementFeatureId);
}

export function clearApiCatalog(): void {
  catalogEntries.clear();
}
