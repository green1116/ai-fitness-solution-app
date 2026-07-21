/**
 * E12-P5 — API Key Management
 */

import { getProductTenant } from "../tenant/tenant.product";
import { API_KEY_STATUSES, API_PERMISSION_SCOPES } from "./api.constants";
import { getDeveloperAccess } from "./api.developer";
import type {
  ApiKey,
  ApiKeyStatus,
  ApiPermissionScope,
  CreateApiKeyInput,
} from "./api.types";

const apiKeys = new Map<string, ApiKey>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function hashKey(raw: string): string {
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  }
  return `hash_${Math.abs(h).toString(36)}`;
}

function cloneKey(key: ApiKey): ApiKey {
  return { ...key, scopes: [...key.scopes], metadata: { ...key.metadata } };
}

export function createApiKey(input: CreateApiKeyInput): ApiKey {
  const productTenantId = input.productTenantId.trim();
  const developerId = input.developerId.trim();
  const name = input.name.trim();

  if (!name) throw new Error("apiKey.name is required");
  if (!getProductTenant(productTenantId)) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }

  const dev = getDeveloperAccess(developerId);
  if (!dev || dev.productTenantId !== productTenantId) {
    throw new Error(`developer not found for tenant: ${developerId}`);
  }
  if (dev.status !== "ACTIVE") {
    throw new Error(`developer not active: ${dev.status}`);
  }

  const scopes = input.scopes ?? ["api:read"];
  for (const s of scopes) {
    if (!(API_PERMISSION_SCOPES as readonly string[]).includes(s)) {
      throw new Error(`invalid api scope: ${s}`);
    }
    if (!dev.scopes.includes(s)) {
      throw new Error(`developer lacks scope: ${s}`);
    }
  }

  const id = input.id?.trim() || createId("apikey");
  if (apiKeys.has(id)) throw new Error(`api key already exists: ${id}`);

  const rawKey = `ek_${createId("live")}`;
  const key: ApiKey = {
    id,
    productTenantId,
    developerId,
    keyHash: hashKey(rawKey),
    name,
    scopes,
    status: "ACTIVE",
    expiresAt: input.expiresAt?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  apiKeys.set(id, key);
  return cloneKey(key);
}

export function revokeApiKey(id: string): ApiKey {
  const key = apiKeys.get(id.trim());
  if (!key) throw new Error(`api key not found: ${id}`);
  if (key.status !== "ACTIVE") {
    throw new Error(`revoke requires ACTIVE (current=${key.status})`);
  }
  key.status = "REVOKED";
  apiKeys.set(key.id, key);
  return cloneKey(key);
}

export function getApiKey(id: string): ApiKey | undefined {
  const key = apiKeys.get(id.trim());
  return key ? cloneKey(key) : undefined;
}

export function listApiKeys(filter?: {
  productTenantId?: string;
  developerId?: string;
  status?: ApiKeyStatus;
}): ApiKey[] {
  let result = [...apiKeys.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((k) => k.productTenantId === tid);
  }
  if (filter?.developerId) {
    const did = filter.developerId.trim();
    result = result.filter((k) => k.developerId === did);
  }
  if (filter?.status) result = result.filter((k) => k.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneKey);
}

export function clearApiKeys(): void {
  apiKeys.clear();
}
