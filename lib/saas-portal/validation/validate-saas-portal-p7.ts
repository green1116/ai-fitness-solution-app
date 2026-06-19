import { buildOwnerContext, buildSupplierRepContext } from "@/lib/saas-rbac";
import { ENTERPRISE_PORTAL } from "../enterprise/enterprise-portal";
import { guardPortalAccess } from "../guards/portal-guard";
import { buildNavigation } from "../navigation/navigation-builder";
import { listPortals, resolvePortal } from "../registry/portal-registry";
import { PORTAL_ERROR_CODES, SaasPortalError } from "../shared/portal-errors";

export interface SaasPortalP7Validation {
  valid: boolean;
  portalCount: number;
  summary: string;
}

export function validateSaasPortalP7(): SaasPortalP7Validation {
  const portals = listPortals();
  const valid = portals.length === 4 && portals.every((portal) => portal.roles.length >= 2);
  return {
    valid,
    portalCount: portals.length,
    summary: `portalCount=${portals.length} valid=${valid}`,
  };
}

export function enterpriseOwnerPortalAccess(): boolean {
  const ctx = buildOwnerContext();
  const result = guardPortalAccess(ctx, "enterprise");
  return result.portalType === "enterprise" && result.navigation.length === ENTERPRISE_PORTAL.navigationKeys.length;
}

export function supplierRepEnterpriseDenied(): boolean {
  const ctx = buildSupplierRepContext();
  try {
    guardPortalAccess(ctx, "enterprise");
    return false;
  } catch (error) {
    return error instanceof SaasPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_ACCESS_DENIED;
  }
}

export function enterpriseNavigationCount(): number {
  const ctx = buildOwnerContext();
  return buildNavigation(ctx).length;
}

export function allPortalsResolvable(): boolean {
  return listPortals().every((portal) => resolvePortal(portal.portalType).portalType === portal.portalType);
}
