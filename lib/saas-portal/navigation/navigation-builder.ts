import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { resolvePortal } from "../registry/portal-registry";
import { PORTAL_ERROR_CODES, SaasPortalError } from "../shared/portal-errors";
import type { NavigationItem, PortalType } from "../shared/portal-types";

const NAVIGATION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  workspace: "Workspace",
  commercial: "Commercial",
  delivery: "Delivery",
  performance: "Performance",
  billing: "Billing",
  projects: "Projects",
  catalog: "Catalog",
  products: "Products",
  orders: "Orders",
  brands: "Brands",
  sku: "SKU",
};

function buildPortalPath(portalType: PortalType, key: string): string {
  return `/saas/portal/${portalType}/${key}`;
}

function resolvePortalTypeFromContext(ctx: TenantContext): PortalType {
  const portalType = ctx.portalType as PortalType;
  if (!portalType) {
    throw new SaasPortalError(PORTAL_ERROR_CODES.PORTAL_NAVIGATION_DENIED, "Missing portalType in context");
  }
  return portalType;
}

export function buildNavigation(ctx: TenantContext): NavigationItem[] {
  const portalType = resolvePortalTypeFromContext(ctx);
  const portal = resolvePortal(portalType);

  if (ctx.roleSystemCode && !portal.roles.includes(ctx.roleSystemCode)) {
    throw new SaasPortalError(
      PORTAL_ERROR_CODES.PORTAL_NAVIGATION_DENIED,
      `Navigation denied for role: ${ctx.roleSystemCode}`,
    );
  }

  return portal.navigationKeys.map((key) => ({
    key,
    label: NAVIGATION_LABELS[key] ?? key,
    path: buildPortalPath(portalType, key),
  }));
}
