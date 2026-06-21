/**
 * V60 P4 — Tenant branding store (in-memory per instance)
 */

import type { TenantBrandingConfig, WhiteLabelTheme } from "../expansion.types";

declare global {
  // eslint-disable-next-line no-var
  var __tenantBranding: Map<string, TenantBrandingConfig> | undefined;
}

function getStore(): Map<string, TenantBrandingConfig> {
  globalThis.__tenantBranding ||= new Map();
  return globalThis.__tenantBranding;
}

export function saveTenantBranding(config: TenantBrandingConfig): TenantBrandingConfig {
  getStore().set(config.organizationId, config);
  return config;
}

export function getTenantBranding(organizationId: string): TenantBrandingConfig | undefined {
  return getStore().get(organizationId);
}

export function clearBrandingStoreForTests(): void {
  globalThis.__tenantBranding = new Map();
}
