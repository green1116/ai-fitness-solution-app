import { resolveQuoteWorkspaceRoute } from "./quote-workspace.resolver";

export const QUOTE_WORKSPACE_PORTAL_SEGMENT = "quotes" as const;

export const QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN =
  "/saas-product/workspaces/[id]/quotes" as const;

export function resolveQuoteWorkspaceQuoteRoute(workspaceId: string): string {
  return resolveQuoteWorkspaceRoute(workspaceId);
}

export function isQuoteWorkspacePortalRoute(route: string, workspaceId: string): boolean {
  return route === resolveQuoteWorkspaceQuoteRoute(workspaceId);
}

export function describeQuoteWorkspacePortalRoute(workspaceId: string): string {
  return resolveQuoteWorkspaceQuoteRoute(workspaceId);
}
