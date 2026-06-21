import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateQuoteProductP6 } from "./validate-quote-product-p6";
import { WORKSPACE_QUOTE_PRODUCT_P7_TAG } from "../freeze/v57-p7-meta";
import {
  assertCanonicalQuotePortalRoute,
  auditQuotePortalRoutes,
} from "../integration-check/v57-p7-route-audit";
import {
  assertNoLegacyPortalLoaderInAppPage,
  assertPortalUiUsesSurfaceOnly,
  checkQuotePortalBypass,
} from "../integration-check/v57-p7-bypass-check";
import {
  QUOTE_PRODUCT_PORTAL_PAGE_BINDING,
  bindQuotePortalRoute,
} from "../portal/quote-product-route";
import {
  QuoteProductPageLoader,
  QuoteProductSurfaceLoader,
  hydrateQuoteProductSurface,
} from "../portal/quote-product-loader";
import {
  QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN,
  resolveQuoteWorkspaceQuoteRoute,
} from "../workspace/quote-workspace.route";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");
const APP_QUOTES_PAGE = join(
  process.cwd(),
  "app",
  "saas-product",
  "workspaces",
  "[id]",
  "quotes",
  "page.tsx",
);

export interface QuoteProductP7Validation {
  valid: boolean;
  summary: string;
}

function getP7ProductFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "portal", "quote-product-route.ts"),
    join(PRODUCT_ROOT, "workspace", "quote-workspace.route.ts"),
    join(PRODUCT_ROOT, "integration-check", "v57-p7-route-audit.ts"),
    join(PRODUCT_ROOT, "integration-check", "v57-p7-bypass-check.ts"),
    join(PRODUCT_ROOT, "validation", "validate-quote-product-p7.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p7-meta.ts"),
    join(PRODUCT_ROOT, "freeze", "v57-p7-final.ts"),
  ];
}

export function assertHasSinglePortalEntryP7(): boolean {
  const page = readFileSync(APP_QUOTES_PAGE, "utf8");
  return page.includes("QuoteProductPageLoader") && !page.includes("QuoteEntryPortalPageLoader");
}

export function assertHasSurfaceOnlyRenderingP7(): boolean {
  return assertPortalUiUsesSurfaceOnly();
}

export function assertNoLegacyEntryRouteP7(): boolean {
  return assertNoLegacyPortalLoaderInAppPage();
}

export function assertNoDirectServiceAccessFromUiP7(): boolean {
  const pagePath = join(PRODUCT_ROOT, "portal", "quote-product-page.tsx");
  const content = readFileSync(pagePath, "utf8");
  const pattern = /from\s+["']\.\.\/service\/|from\s+["']@\/lib\/quote-product\/service\//;
  return !pattern.test(content);
}

export function assertNoExecutionClientInUiP7(): boolean {
  const pagePath = join(PRODUCT_ROOT, "portal", "quote-product-page.tsx");
  const content = readFileSync(pagePath, "utf8");
  const pattern = /from\s+["']\.\.\/execution\/|from\s+["']@\/lib\/quote-product\/execution\//;
  return !pattern.test(content);
}

export function assertNoRuntimeImportInUiP7(): boolean {
  const portalFiles = [
    join(PRODUCT_ROOT, "portal", "quote-product-page.tsx"),
    join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx"),
  ];
  const pattern = /from\s+["']@\/lib\/quote-runtime-integration["']|from\s+["']@\/lib\/quote-runtime["']|from\s+["']@\/lib\/quote-runtime\//;
  return portalFiles.every((file) => !pattern.test(readFileSync(file, "utf8")));
}

export function assertHasLoaderHydrationP7(): boolean {
  const loaderPath = join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx");
  const content = readFileSync(loaderPath, "utf8");
  return (
    content.includes("QuoteProductSurfaceLoader") &&
    content.includes("hydrateQuoteProductSurface") &&
    content.includes("QuoteProductPageLoader")
  );
}

export function assertHasRouteConsolidationP7(): boolean {
  const routePath = join(PRODUCT_ROOT, "portal", "quote-product-route.ts");
  const workspaceRoutePath = join(PRODUCT_ROOT, "workspace", "quote-workspace.route.ts");
  const route = readFileSync(routePath, "utf8");
  const workspaceRoute = readFileSync(workspaceRoutePath, "utf8");
  const page = readFileSync(APP_QUOTES_PAGE, "utf8");

  return (
    route.includes("bindQuotePortalRoute") &&
    route.includes("LEGACY_QUOTE_PORTAL_LOADERS") &&
    workspaceRoute.includes("resolveQuoteWorkspaceQuoteRoute") &&
    page.includes("quote-product-route")
  );
}

export function assertMountedQuotePortalWiring(): boolean {
  const workspaceId = "v57-p7-portal-wiring";
  const bound = bindQuotePortalRoute(workspaceId);
  const surface = QuoteProductSurfaceLoader(workspaceId);
  const hydrated = hydrateQuoteProductSurface(workspaceId);
  const routeAudit = auditQuotePortalRoutes();
  const bypass = checkQuotePortalBypass();

  return (
    bound.portalRoute === resolveQuoteWorkspaceQuoteRoute(workspaceId) &&
    surface.workspaceId === workspaceId &&
    hydrated.viewModel.workspaceId === workspaceId &&
    routeAudit.valid &&
    bypass.valid &&
    QUOTE_PRODUCT_PORTAL_PAGE_BINDING.surfaceLoader === "QuoteProductSurfaceLoader" &&
    QUOTE_WORKSPACE_PORTAL_ROUTE_PATTERN.includes("quotes")
  );
}

export async function validateQuoteProductP7(): Promise<QuoteProductP7Validation> {
  const p6 = await validateQuoteProductP6();
  const mounted = assertMountedQuotePortalWiring();
  const valid =
    p6.valid &&
    getP7ProductFiles().every((file) => existsSync(file)) &&
    assertHasSinglePortalEntryP7() &&
    assertHasSurfaceOnlyRenderingP7() &&
    assertNoLegacyEntryRouteP7() &&
    assertNoDirectServiceAccessFromUiP7() &&
    assertNoExecutionClientInUiP7() &&
    assertNoRuntimeImportInUiP7() &&
    assertHasLoaderHydrationP7() &&
    assertHasRouteConsolidationP7() &&
    assertCanonicalQuotePortalRoute("v57-p7-canonical-route") &&
    mounted;

  return {
    valid,
    summary: [`p7Tag=${WORKSPACE_QUOTE_PRODUCT_P7_TAG}`, `valid=${valid}`].join(" "),
  };
}
