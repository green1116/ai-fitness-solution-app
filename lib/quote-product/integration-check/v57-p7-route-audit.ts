import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  QUOTE_PRODUCT_PORTAL_PAGE_BINDING,
  QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN,
  resolveQuotePortalWorkspace,
} from "../portal/quote-product-route";
import {
  QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN,
  resolveQuoteWorkspaceQuoteRoute,
} from "../workspace/quote-workspace.route";

const APP_QUOTES_PAGE = join(
  process.cwd(),
  "app",
  "saas-product",
  "workspaces",
  "[id]",
  "quotes",
  "page.tsx",
);

export interface QuotePortalRouteAudit {
  valid: boolean;
  summary: string;
  canonicalRoute: string;
  pageBinding: typeof QUOTE_PRODUCT_PORTAL_PAGE_BINDING;
}

export function auditQuotePortalRoutes(): QuotePortalRouteAudit {
  const pageExists = existsSync(APP_QUOTES_PAGE);
  const page = pageExists ? readFileSync(APP_QUOTES_PAGE, "utf8") : "";
  const usesProductLoader = page.includes("QuoteProductPageLoader");
  const avoidsLegacyLoader = !page.includes("QuoteEntryPortalPageLoader");
  const usesRouteBinding = page.includes("quote-product-route");
  const workspaceRouteOk =
    QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN === QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN;

  const valid =
    pageExists &&
    usesProductLoader &&
    avoidsLegacyLoader &&
    usesRouteBinding &&
    workspaceRouteOk;

  return {
    valid,
    canonicalRoute: QUOTE_PRODUCT_PORTAL_ROUTE_PATTERN,
    pageBinding: QUOTE_PRODUCT_PORTAL_PAGE_BINDING,
    summary: [
      `pageExists=${pageExists}`,
      `usesProductLoader=${usesProductLoader}`,
      `avoidsLegacyLoader=${avoidsLegacyLoader}`,
      `usesRouteBinding=${usesRouteBinding}`,
    ].join(" "),
  };
}

export function assertCanonicalQuotePortalRoute(workspaceId: string): boolean {
  const bound = resolveQuotePortalWorkspace(workspaceId);
  return bound.portalRoute === resolveQuoteWorkspaceQuoteRoute(workspaceId);
}
