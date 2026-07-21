/**
 * E12-P5 — Permission Scope Evaluation
 * Integrates developer access, API catalog, admin permission, and entitlement
 */

import { hasAdminPermission } from "../admin/admin.permission";
import { getApiCatalogEntry, isApiEntitlementGranted } from "./api.catalog";
import { getDeveloperAccess } from "./api.developer";
import { getApiKey } from "./api.key";
import type { ApiPermissionScope, ApiScopeEvaluationResult } from "./api.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function evaluateApiScope(input: {
  developerId: string;
  scope: ApiPermissionScope;
  productTenantId?: string;
  organizationId?: string;
}): ApiScopeEvaluationResult {
  const developerId = input.developerId.trim();
  const scope = input.scope;

  const dev = getDeveloperAccess(developerId);
  if (!dev) {
    return {
      decision: "DENY",
      developerId,
      scope,
      reason: "developer not found",
      evaluatedAt: nowIso(),
    };
  }
  if (dev.status !== "ACTIVE") {
    return {
      decision: "DENY",
      developerId,
      scope,
      reason: `developer not active: ${dev.status}`,
      evaluatedAt: nowIso(),
    };
  }

  if (!dev.scopes.includes(scope)) {
    return {
      decision: "DENY",
      developerId,
      scope,
      reason: "scope not granted to developer",
      evaluatedAt: nowIso(),
    };
  }

  return {
    decision: "ALLOW",
    developerId,
    scope,
    reason: "scope granted",
    evaluatedAt: nowIso(),
  };
}

export function evaluateApiCallAccess(input: {
  apiKeyId: string;
  apiCatalogEntryId: string;
}): ApiScopeEvaluationResult {
  const key = getApiKey(input.apiKeyId.trim());
  if (!key || key.status !== "ACTIVE") {
    return {
      decision: "DENY",
      developerId: key?.developerId ?? "unknown",
      scope: "api:read",
      reason: key ? `key not active: ${key.status}` : "key not found",
      evaluatedAt: nowIso(),
    };
  }

  const entry = getApiCatalogEntry(input.apiCatalogEntryId.trim());
  if (!entry || entry.status !== "ACTIVE") {
    return {
      decision: "DENY",
      developerId: key.developerId,
      scope: "api:read",
      reason: entry
        ? `api not active: ${entry.status}`
        : "api catalog entry not found",
      evaluatedAt: nowIso(),
    };
  }

  if (!key.scopes.includes(entry.requiredScope)) {
    return {
      decision: "DENY",
      developerId: key.developerId,
      scope: entry.requiredScope,
      reason: `key lacks required scope: ${entry.requiredScope}`,
      evaluatedAt: nowIso(),
    };
  }

  if (!isApiEntitlementGranted(key.productTenantId, entry.id)) {
    return {
      decision: "DENY",
      developerId: key.developerId,
      scope: entry.requiredScope,
      reason: "entitlement not granted for api",
      evaluatedAt: nowIso(),
    };
  }

  return {
    decision: "ALLOW",
    developerId: key.developerId,
    scope: entry.requiredScope,
    reason: "access granted",
    evaluatedAt: nowIso(),
  };
}
