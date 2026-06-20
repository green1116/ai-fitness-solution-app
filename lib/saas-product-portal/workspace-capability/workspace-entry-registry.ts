import type { WorkspaceProductEntry } from "../shared/portal-types";

export const WORKSPACE_PRODUCT_ENTRY_REGISTRY: WorkspaceProductEntry[] = [
  {
    key: "quote",
    label: "Quotes",
    description: "Commercial quote surfaces mount here in a future business layer.",
    segment: "quotes",
    status: "registered",
    capability: "entry-only",
  },
  {
    key: "project",
    label: "Projects",
    description: "Project delivery entry placeholder for workspace-scoped work.",
    segment: "projects",
    status: "registered",
    capability: "entry-only",
  },
  {
    key: "report",
    label: "Reports",
    description: "Reporting entry placeholder for workspace analytics.",
    segment: "reports",
    status: "registered",
    capability: "entry-only",
  },
  {
    key: "procurement",
    label: "Procurement",
    description: "Procurement entry reserved for future sourcing workflows.",
    segment: "procurement",
    status: "planned",
    capability: "entry-only",
  },
];

export function getWorkspaceProductEntry(key: string): WorkspaceProductEntry | undefined {
  return WORKSPACE_PRODUCT_ENTRY_REGISTRY.find((entry) => entry.key === key);
}

export function listRegisteredWorkspaceProductEntries(): WorkspaceProductEntry[] {
  return WORKSPACE_PRODUCT_ENTRY_REGISTRY.filter((entry) => entry.status === "registered");
}
