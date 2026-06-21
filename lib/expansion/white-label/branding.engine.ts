/**
 * V60 P4 — White-label branding engine
 */

import type { TenantBrandingConfig, WhiteLabelTheme } from "../expansion.types";
import { generateWhiteLabelTheme, resolveThemeForOrganization } from "./theme.resolver";
import { getTenantBranding, saveTenantBranding } from "./tenant.branding";

export function createCustomBranding(input: {
  organizationId: string;
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  enabled?: boolean;
}): TenantBrandingConfig {
  const theme = generateWhiteLabelTheme({
    companyName: input.companyName,
    logoUrl: input.logoUrl,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    domain: input.domain,
  });

  return saveTenantBranding({
    organizationId: input.organizationId,
    theme,
    enabled: input.enabled ?? true,
    updatedAt: new Date().toISOString(),
  });
}

export function getBrandingForTenant(organizationId: string): {
  config: TenantBrandingConfig | undefined;
  theme: WhiteLabelTheme;
} {
  return {
    config: getTenantBranding(organizationId),
    theme: resolveThemeForOrganization(organizationId),
  };
}

export { generateWhiteLabelTheme, resolveThemeForOrganization };
