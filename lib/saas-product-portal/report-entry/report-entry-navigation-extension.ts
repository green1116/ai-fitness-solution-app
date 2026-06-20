import { saasProductPortalWorkspaceProductPath } from "../shared/portal-constants";
import { WORKSPACE_PRODUCT_NAV_ITEMS } from "../workspace-capability/workspace-product-navigation";
import type { ReportEntryNavMount, WorkspaceProductNavItem } from "../shared/portal-types";
import { REPORT_ENTRY_REGISTRY_SEGMENT } from "./report-entry-registry-extension";

export const REPORT_ENTRY_NAV_KEY = "reports" as const;

export const REPORT_ENTRY_NAV_MOUNT: ReportEntryNavMount = {
  key: REPORT_ENTRY_NAV_KEY,
  label: "Reports",
  segment: REPORT_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
};

export function getReportNavItemFromWorkspaceNavigation(): WorkspaceProductNavItem | undefined {
  return WORKSPACE_PRODUCT_NAV_ITEMS.find((item) => item.key === REPORT_ENTRY_NAV_KEY);
}

export function assertReportsNavExistsInWorkspaceNavigation(): boolean {
  const item = getReportNavItemFromWorkspaceNavigation();
  if (!item || item.key !== REPORT_ENTRY_NAV_KEY || item.label !== "Reports") {
    return false;
  }
  const samplePath = item.href("sample-workspace-id");
  return samplePath.endsWith(`/${REPORT_ENTRY_REGISTRY_SEGMENT}`);
}

export function resolveReportEntryHref(workspaceId: string): string {
  return saasProductPortalWorkspaceProductPath(workspaceId, REPORT_ENTRY_REGISTRY_SEGMENT);
}

export function getReportEntryNavMount(): ReportEntryNavMount {
  return REPORT_ENTRY_NAV_MOUNT;
}
