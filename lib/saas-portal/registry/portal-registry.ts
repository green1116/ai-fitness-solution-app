import { CONTRACTOR_PORTAL } from "../contractor/contractor-portal";
import { ENTERPRISE_PORTAL } from "../enterprise/enterprise-portal";
import { MANUFACTURER_PORTAL } from "../manufacturer/manufacturer-portal";
import { SUPPLIER_PORTAL } from "../supplier/supplier-portal";
import { PORTAL_ERROR_CODES, SaasPortalError } from "../shared/portal-errors";
import type { PortalDefinition, PortalType } from "../shared/portal-types";

const PORTAL_REGISTRY: Record<PortalType, PortalDefinition> = {
  enterprise: ENTERPRISE_PORTAL,
  contractor: CONTRACTOR_PORTAL,
  supplier: SUPPLIER_PORTAL,
  manufacturer: MANUFACTURER_PORTAL,
};

export const SAAS_PORTAL_TYPES: PortalType[] = ["enterprise", "contractor", "supplier", "manufacturer"];

export function resolvePortal(portalType: PortalType): PortalDefinition {
  const portal = PORTAL_REGISTRY[portalType];
  if (!portal) {
    throw new SaasPortalError(PORTAL_ERROR_CODES.PORTAL_NOT_FOUND, `Portal not found: ${portalType}`);
  }
  return portal;
}

export function listPortals(): PortalDefinition[] {
  return SAAS_PORTAL_TYPES.map((type) => PORTAL_REGISTRY[type]);
}
