import { SAAS_PORTAL_TYPES, SAAS_TENANT_STATUSES } from "../shared/constants";

export function isValidTenantStatus(status: string): boolean {
  return (SAAS_TENANT_STATUSES as readonly string[]).includes(status);
}

export function isValidPortalType(portalType: string): boolean {
  return (SAAS_PORTAL_TYPES as readonly string[]).includes(portalType);
}

export function isValidTenantSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,64}$/.test(slug);
}
