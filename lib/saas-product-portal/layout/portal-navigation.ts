import { buildNavigation } from "@/lib/saas-portal";
import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { NavigationItem } from "@/lib/saas-portal/shared/portal-types";
import {
  PORTAL_PRODUCT_NAV_PATHS,
  SAAS_PRODUCT_PORTAL_SETTINGS_PATH,
} from "../shared/portal-constants";

export function buildProductPortalNavigation(ctx: TenantContext): NavigationItem[] {
  const navigation = buildNavigation(ctx).map((item) => ({
    ...item,
    path: PORTAL_PRODUCT_NAV_PATHS[item.key] ?? item.path,
  }));

  return [
    ...navigation,
    {
      key: "settings",
      label: "Settings",
      path: SAAS_PRODUCT_PORTAL_SETTINGS_PATH,
    },
  ];
}
