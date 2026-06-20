import type { ProjectEntryStatusView } from "../shared/portal-types";

export const PROJECT_ENTRY_STATUS_VIEW: ProjectEntryStatusView = {
  phase: "P7",
  layer: "business-entry",
  capability: "entry-only",
  projectRuntime: false,
  label: "Entry Ready",
  summary: "Project Entry UI shell mounted · project runtime not implemented",
};

export function getProjectEntryStatusView(): ProjectEntryStatusView {
  return PROJECT_ENTRY_STATUS_VIEW;
}
