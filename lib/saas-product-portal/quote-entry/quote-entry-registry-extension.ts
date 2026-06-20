import {
  getWorkspaceProductEntry,
  WORKSPACE_PRODUCT_ENTRY_REGISTRY,
} from "../workspace-capability/workspace-entry-registry";
import type { QuoteEntryRegistryMount, WorkspaceProductEntry } from "../shared/portal-types";

export const QUOTE_ENTRY_REGISTRY_KEY = "quote" as const;

export const QUOTE_ENTRY_REGISTRY_SEGMENT = "quotes" as const;

export const QUOTE_ENTRY_REGISTRY_MOUNT: QuoteEntryRegistryMount = {
  key: QUOTE_ENTRY_REGISTRY_KEY,
  segment: QUOTE_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
  status: "registered",
  capability: "entry-only",
  note: "P6 Quote Entry UI shell · no commercial logic",
};

export function getQuoteEntryFromWorkspaceRegistry(): WorkspaceProductEntry | undefined {
  return getWorkspaceProductEntry(QUOTE_ENTRY_REGISTRY_KEY);
}

export function assertQuoteEntryRegisteredInWorkspaceRegistry(): boolean {
  const entry = getQuoteEntryFromWorkspaceRegistry();
  return (
    entry?.key === QUOTE_ENTRY_REGISTRY_KEY &&
    entry.segment === QUOTE_ENTRY_REGISTRY_SEGMENT &&
    entry.status === "registered" &&
    entry.capability === "entry-only"
  );
}

export function listWorkspaceRegistryQuoteMounts(): QuoteEntryRegistryMount[] {
  const entry = getQuoteEntryFromWorkspaceRegistry();
  if (!entry || entry.key !== QUOTE_ENTRY_REGISTRY_KEY) {
    return [];
  }
  return [QUOTE_ENTRY_REGISTRY_MOUNT];
}

export function getWorkspaceRegistryQuoteCount(): number {
  return WORKSPACE_PRODUCT_ENTRY_REGISTRY.filter((entry) => entry.key === QUOTE_ENTRY_REGISTRY_KEY).length;
}
