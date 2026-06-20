import {
  getWorkspaceProductEntry,
  WORKSPACE_PRODUCT_ENTRY_REGISTRY,
} from "../workspace-capability/workspace-entry-registry";
import type { ProjectEntryRegistryMount, WorkspaceProductEntry } from "../shared/portal-types";

export const PROJECT_ENTRY_REGISTRY_KEY = "project" as const;

export const PROJECT_ENTRY_REGISTRY_SEGMENT = "projects" as const;

export const PROJECT_ENTRY_REGISTRY_MOUNT: ProjectEntryRegistryMount = {
  key: PROJECT_ENTRY_REGISTRY_KEY,
  segment: PROJECT_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
  status: "registered",
  capability: "entry-only",
  note: "P7 Project Entry UI shell · no project runtime",
};

export function getProjectEntryFromWorkspaceRegistry(): WorkspaceProductEntry | undefined {
  return getWorkspaceProductEntry(PROJECT_ENTRY_REGISTRY_KEY);
}

export function assertProjectEntryRegisteredInWorkspaceRegistry(): boolean {
  const entry = getProjectEntryFromWorkspaceRegistry();
  return (
    entry?.key === PROJECT_ENTRY_REGISTRY_KEY &&
    entry.segment === PROJECT_ENTRY_REGISTRY_SEGMENT &&
    entry.status === "registered" &&
    entry.capability === "entry-only"
  );
}

export function listWorkspaceRegistryProjectMounts(): ProjectEntryRegistryMount[] {
  const entry = getProjectEntryFromWorkspaceRegistry();
  if (!entry || entry.key !== PROJECT_ENTRY_REGISTRY_KEY) {
    return [];
  }
  return [PROJECT_ENTRY_REGISTRY_MOUNT];
}

export function getWorkspaceRegistryProjectCount(): number {
  return WORKSPACE_PRODUCT_ENTRY_REGISTRY.filter((entry) => entry.key === PROJECT_ENTRY_REGISTRY_KEY).length;
}
