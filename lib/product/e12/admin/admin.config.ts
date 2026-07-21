/**
 * E12-P3 — Product Configuration
 * Integrates product registry and tenant scope
 */

import { getProductIdentity } from "../identity/product.identity";
import { getProductRegistryManifest } from "../registry/product.registry";
import { getProductTenant } from "../tenant/tenant.product";
import { PRODUCT_CONFIG_SCOPES } from "./admin.constants";
import { getOrganization } from "./admin.organization";
import type {
  ProductConfigScope,
  ProductConfiguration,
  SetProductConfigurationInput,
} from "./admin.types";

const configurations = new Map<string, ProductConfiguration>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function configKey(
  productId: string,
  scope: ProductConfigScope,
  key: string,
  organizationId?: string,
  productTenantId?: string,
): string {
  return [productId, scope, organizationId ?? "", productTenantId ?? "", key].join(
    ":",
  );
}

function cloneConfig(config: ProductConfiguration): ProductConfiguration {
  return { ...config, metadata: { ...config.metadata } };
}

export function setProductConfiguration(
  input: SetProductConfigurationInput,
): ProductConfiguration {
  const productId = input.productId.trim();
  const key = input.key.trim();
  const updatedBy = input.updatedBy.trim();
  const scope = input.scope;

  if (!productId) throw new Error("config.productId is required");
  if (!key) throw new Error("config.key is required");
  if (!updatedBy) throw new Error("config.updatedBy is required");
  if (!(PRODUCT_CONFIG_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid config scope: ${scope}`);
  }
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const registry = getProductRegistryManifest();
  if (registry.identityCount < 1) {
    throw new Error("product registry has no identities");
  }

  if (scope === "ORGANIZATION") {
    const orgId = input.organizationId?.trim();
    if (!orgId || !getOrganization(orgId)) {
      throw new Error(`organization required for ORGANIZATION scope: ${orgId}`);
    }
  }

  if (scope === "TENANT") {
    const tenantId = input.productTenantId?.trim();
    if (!tenantId || !getProductTenant(tenantId)) {
      throw new Error(`tenant required for TENANT scope: ${tenantId}`);
    }
  }

  const id =
    input.id?.trim() ||
    createId("cfg");
  const mapKey = configKey(
    productId,
    scope,
    key,
    input.organizationId,
    input.productTenantId,
  );

  const existing = configurations.get(mapKey);
  const config: ProductConfiguration = {
    id: existing?.id ?? id,
    productId,
    scope,
    organizationId: input.organizationId?.trim() || undefined,
    productTenantId: input.productTenantId?.trim() || undefined,
    key,
    value: input.value,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
    updatedBy,
  };
  configurations.set(mapKey, config);
  return cloneConfig(config);
}

export function getProductConfiguration(input: {
  productId: string;
  scope: ProductConfigScope;
  key: string;
  organizationId?: string;
  productTenantId?: string;
}): ProductConfiguration | undefined {
  const mapKey = configKey(
    input.productId.trim(),
    input.scope,
    input.key.trim(),
    input.organizationId,
    input.productTenantId,
  );
  const config = configurations.get(mapKey);
  return config ? cloneConfig(config) : undefined;
}

export function listProductConfigurations(filter?: {
  productId?: string;
  scope?: ProductConfigScope;
  organizationId?: string;
  productTenantId?: string;
}): ProductConfiguration[] {
  let result = [...configurations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((c) => c.productId === pid);
  }
  if (filter?.scope) result = result.filter((c) => c.scope === filter.scope);
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((c) => c.organizationId === oid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((c) => c.productTenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConfig);
}

export function clearProductConfigurations(): void {
  configurations.clear();
}
