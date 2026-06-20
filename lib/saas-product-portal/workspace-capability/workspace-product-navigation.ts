import {
  saasProductPortalWorkspaceOverviewPath,
  saasProductPortalWorkspaceProductPath,
} from "../shared/portal-constants";
import type { WorkspaceProductNavItem } from "../shared/portal-types";

export const WORKSPACE_PRODUCT_NAV_ITEMS: WorkspaceProductNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    href: (workspaceId) => saasProductPortalWorkspaceOverviewPath(workspaceId),
  },
  {
    key: "projects",
    label: "Projects",
    segment: "projects",
    href: (workspaceId) => saasProductPortalWorkspaceProductPath(workspaceId, "projects"),
  },
  {
    key: "quotes",
    label: "Quotes",
    segment: "quotes",
    href: (workspaceId) => saasProductPortalWorkspaceProductPath(workspaceId, "quotes"),
  },
  {
    key: "reports",
    label: "Reports",
    segment: "reports",
    href: (workspaceId) => saasProductPortalWorkspaceProductPath(workspaceId, "reports"),
  },
];

export function resolveActiveWorkspaceNavKey(pathname: string, workspaceId: string): string {
  const base = saasProductPortalWorkspaceOverviewPath(workspaceId);
  if (pathname === base) {
    return "overview";
  }
  for (const item of WORKSPACE_PRODUCT_NAV_ITEMS) {
    if (!item.segment) continue;
    if (pathname.startsWith(saasProductPortalWorkspaceProductPath(workspaceId, item.segment))) {
      return item.key;
    }
  }
  return "overview";
}
