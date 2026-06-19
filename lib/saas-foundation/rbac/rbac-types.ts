import { SAAS_PERMISSIONS } from "./permission-catalog";
import { SAAS_SYSTEM_ROLES } from "./role-catalog";

export interface SaasRbacCatalogSnapshot {
  permissionKeys: string[];
  roleSystemCodes: string[];
}

export function buildRbacCatalogSnapshot(): SaasRbacCatalogSnapshot {
  return {
    permissionKeys: SAAS_PERMISSIONS.map((item) => item.key),
    roleSystemCodes: SAAS_SYSTEM_ROLES.map((item) => item.systemCode),
  };
}
