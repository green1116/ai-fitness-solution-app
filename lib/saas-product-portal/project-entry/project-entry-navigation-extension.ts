import { saasProductPortalWorkspaceProductPath } from "../shared/portal-constants";
import { WORKSPACE_PRODUCT_NAV_ITEMS } from "../workspace-capability/workspace-product-navigation";
import type { ProjectEntryNavMount, WorkspaceProductNavItem } from "../shared/portal-types";
import { PROJECT_ENTRY_REGISTRY_SEGMENT } from "./project-entry-registry-extension";

export const PROJECT_ENTRY_NAV_KEY = "projects" as const;

export const PROJECT_ENTRY_NAV_MOUNT: ProjectEntryNavMount = {
  key: PROJECT_ENTRY_NAV_KEY,
  label: "Projects",
  segment: PROJECT_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
};

export function getProjectNavItemFromWorkspaceNavigation(): WorkspaceProductNavItem | undefined {
  return WORKSPACE_PRODUCT_NAV_ITEMS.find((item) => item.key === PROJECT_ENTRY_NAV_KEY);
}

export function assertProjectsNavExistsInWorkspaceNavigation(): boolean {
  const item = getProjectNavItemFromWorkspaceNavigation();
  if (!item || item.key !== PROJECT_ENTRY_NAV_KEY || item.label !== "Projects") {
    return false;
  }
  const samplePath = item.href("sample-workspace-id");
  return samplePath.endsWith(`/${PROJECT_ENTRY_REGISTRY_SEGMENT}`);
}

export function resolveProjectEntryHref(workspaceId: string): string {
  return saasProductPortalWorkspaceProductPath(workspaceId, PROJECT_ENTRY_REGISTRY_SEGMENT);
}

export function getProjectEntryNavMount(): ProjectEntryNavMount {
  return PROJECT_ENTRY_NAV_MOUNT;
}
