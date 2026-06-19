export * from "./shared/portal-types";
export * from "./shared/portal-errors";
export { ENTERPRISE_PORTAL } from "./enterprise/enterprise-portal";
export { CONTRACTOR_PORTAL } from "./contractor/contractor-portal";
export { SUPPLIER_PORTAL } from "./supplier/supplier-portal";
export { MANUFACTURER_PORTAL } from "./manufacturer/manufacturer-portal";
export { resolvePortal, listPortals, SAAS_PORTAL_TYPES } from "./registry/portal-registry";
export { buildNavigation } from "./navigation/navigation-builder";
export { guardPortalAccess, resolvePortalContext } from "./guards/portal-guard";
export {
  validateSaasPortalP7,
  enterpriseOwnerPortalAccess,
  supplierRepEnterpriseDenied,
  enterpriseNavigationCount,
  allPortalsResolvable,
} from "./validation/validate-saas-portal-p7";

export const SAAS_PORTAL_META = {
  version: "v48-saas-portal-p7",
  tag: "v48-saas-portal-p7",
} as const;
