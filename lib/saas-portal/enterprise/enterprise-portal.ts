import type { PortalDefinition } from "../shared/portal-types";

export const ENTERPRISE_PORTAL: PortalDefinition = {
  portalType: "enterprise",
  displayName: "Enterprise Portal",
  roles: ["enterprise_owner", "enterprise_admin", "enterprise_sales"],
  navigationKeys: ["dashboard", "workspace", "commercial", "delivery", "performance", "billing"],
};
