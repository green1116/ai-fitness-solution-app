import { saasProductPortalWorkspaceProductPath } from "../shared/portal-constants";
import {
  WORKSPACE_PRODUCT_NAV_ITEMS,
} from "../workspace-capability/workspace-product-navigation";
import type { QuoteEntryNavMount, WorkspaceProductNavItem } from "../shared/portal-types";
import { QUOTE_ENTRY_REGISTRY_SEGMENT } from "./quote-entry-registry-extension";

export const QUOTE_ENTRY_NAV_KEY = "quotes" as const;

export const QUOTE_ENTRY_NAV_MOUNT: QuoteEntryNavMount = {
  key: QUOTE_ENTRY_NAV_KEY,
  label: "Quotes",
  segment: QUOTE_ENTRY_REGISTRY_SEGMENT,
  layer: "business-entry",
};

export function getQuoteNavItemFromWorkspaceNavigation(): WorkspaceProductNavItem | undefined {
  return WORKSPACE_PRODUCT_NAV_ITEMS.find((item) => item.key === QUOTE_ENTRY_NAV_KEY);
}

export function assertQuotesNavExistsInWorkspaceNavigation(): boolean {
  const item = getQuoteNavItemFromWorkspaceNavigation();
  if (!item || item.key !== QUOTE_ENTRY_NAV_KEY || item.label !== "Quotes") {
    return false;
  }
  const samplePath = item.href("sample-workspace-id");
  return samplePath.endsWith(`/${QUOTE_ENTRY_REGISTRY_SEGMENT}`);
}

export function resolveQuoteEntryHref(workspaceId: string): string {
  return saasProductPortalWorkspaceProductPath(workspaceId, QUOTE_ENTRY_REGISTRY_SEGMENT);
}

export function getQuoteEntryNavMount(): QuoteEntryNavMount {
  return QUOTE_ENTRY_NAV_MOUNT;
}
