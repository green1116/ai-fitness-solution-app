import type { PortalDefinition } from "../shared/portal-types";

export const MANUFACTURER_PORTAL: PortalDefinition = {
  portalType: "manufacturer",
  displayName: "Manufacturer Portal",
  roles: ["manufacturer_admin", "manufacturer_sku_manager"],
  navigationKeys: ["dashboard", "brands", "sku", "catalog"],
};
