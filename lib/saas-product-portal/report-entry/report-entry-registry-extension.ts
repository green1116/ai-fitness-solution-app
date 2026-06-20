import {
  getWorkspaceProductEntry,
  WORKSPACE_PRODUCT_ENTRY_REGISTRY,
} from "../workspace-capability/workspace-entry-registry";
import type { ReportEntryRegistryMount, WorkspaceProductEntry } from "../shared/portal-types";

export const REPORT_ENTRY_REGISTRY_KEY = "report" as const;

export const REPORT_ENTRY_REGISTRY_SEGMENT = "reports" as const;

export const REPORT_ENTRY_REGISTRY_MOUNT: ReportEntryRegistryMount = {
  key: REPORT_ENTRY_REGISTRY_KEY,
  segment: REPORT_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
  status: "registered",
  capability: "entry-only",
  note: "P8 Report Entry UI shell · no report runtime",
};

export function getReportEntryFromWorkspaceRegistry(): WorkspaceProductEntry | undefined {
  return getWorkspaceProductEntry(REPORT_ENTRY_REGISTRY_KEY);
}

export function assertReportEntryRegisteredInWorkspaceRegistry(): boolean {
  const entry = getReportEntryFromWorkspaceRegistry();
  return (
    entry?.key === REPORT_ENTRY_REGISTRY_KEY &&
    entry.segment === REPORT_ENTRY_REGISTRY_SEGMENT &&
    entry.status === "registered" &&
    entry.capability === "entry-only"
  );
}

export function listWorkspaceRegistryReportMounts(): ReportEntryRegistryMount[] {
  const entry = getReportEntryFromWorkspaceRegistry();
  if (!entry || entry.key !== REPORT_ENTRY_REGISTRY_KEY) {
    return [];
  }
  return [REPORT_ENTRY_REGISTRY_MOUNT];
}

export function getWorkspaceRegistryReportCount(): number {
  return WORKSPACE_PRODUCT_ENTRY_REGISTRY.filter((entry) => entry.key === REPORT_ENTRY_REGISTRY_KEY).length;
}
