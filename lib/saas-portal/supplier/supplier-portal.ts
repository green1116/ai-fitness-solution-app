import type { PortalDefinition } from "../shared/portal-types";

export const SUPPLIER_PORTAL: PortalDefinition = {
  portalType: "supplier",
  displayName: "Supplier Portal",
  roles: ["supplier_admin", "supplier_rep"],
  navigationKeys: ["dashboard", "catalog", "products", "orders"],
};
