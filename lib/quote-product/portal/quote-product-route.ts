import {
  QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN,
  resolveQuoteWorkspaceQuoteRoute,
} from "../workspace/quote-workspace.route";

export const QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN = QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN;

export const LEGACY_QUOTE_PORTAL_LOADERS = [
  "QuoteEntryPortalPageLoader",
  "renderQuoteEntryPortalPage",
  "submitQuoteEntryFormAction",
] as const;

export const QUOTE_PRODUCT_PORTAL_PAGE_BINDING = {
  page: "SaasProductWorkspaceQuotesPage",
  loader: "QuoteProductPageLoader",
  surfaceLoader: "QuoteProductSurfaceLoader",
  sourceOfTruth: "QuoteProductSurface",
} as const;

export function resolveQuotePortalWorkspace(workspaceId: string) {
  const normalizedWorkspaceId = workspaceId.trim();
  if (normalizedWorkspaceId.length === 0) {
    throw new Error("workspaceId is required");
  }

  return {
    workspaceId: normalizedWorkspaceId,
    portalRoute: resolveQuoteWorkspaceQuoteRoute(normalizedWorkspaceId),
  };
}

export function bindQuotePortalRoute(workspaceId: string) {
  return resolveQuotePortalWorkspace(workspaceId);
}

export function isLegacyQuotePortalLoader(name: string): boolean {
  return LEGACY_QUOTE_PORTAL_LOADERS.includes(name as (typeof LEGACY_QUOTE_PORTAL_LOADERS)[number]);
}

export function describeQuoteProductPortalRoute(workspaceId: string): string {
  const bound = bindQuotePortalRoute(workspaceId);
  return [
    `pattern=${QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN}`,
    `workspaceId=${bound.workspaceId}`,
    `route=${bound.portalRoute}`,
    `loader=${QUOTE_PRODUCT_PORTAL_PAGE_BINDING.loader}`,
    `surfaceLoader=${QUOTE_PRODUCT_PORTAL_PAGE_BINDING.surfaceLoader}`,
  ].join(" ");
}
