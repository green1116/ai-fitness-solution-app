import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { LEGACY_QUOTE_PORTAL_LOADERS } from "../portal/quote-product-route";

const PRODUCT_ROOT = join(process.cwd(), "lib", "quote-product");

function getPortalUiFiles(): string[] {
  return [
    join(PRODUCT_ROOT, "portal", "quote-product-page.tsx"),
    join(PRODUCT_ROOT, "portal", "quote-product-loader.tsx"),
  ];
}

function getAppQuotesPage(): string {
  return join(process.cwd(), "app", "saas-product", "workspaces", "[id]", "quotes", "page.tsx");
}

export interface QuotePortalBypassCheck {
  valid: boolean;
  summary: string;
}

export function checkQuotePortalBypass(): QuotePortalBypassCheck {
  const appPage = existsSync(getAppQuotesPage()) ? readFileSync(getAppQuotesPage(), "utf8") : "";
  const portalFiles = getPortalUiFiles().map((file) => readFileSync(file, "utf8"));

  const legacyInApp = LEGACY_QUOTE_PORTAL_LOADERS.some((loader) => appPage.includes(loader));

  const directEntryPattern =
    /from\s+["']\.\.\/entry\/|from\s+["']@\/lib\/quote-product\/entry\/|submitQuoteEntry\b|buildQuoteEntrySurface\b/;
  const directServicePattern =
    /from\s+["']\.\.\/service\/|from\s+["']@\/lib\/quote-product\/service\/|submitQuoteToProductService\b|orchestrateQuoteExecution\b/;
  const directExecutionPattern =
    /from\s+["']\.\.\/execution\/|from\s+["']@\/lib\/quote-product\/execution\/|executeQuoteRuntime\b|executeQuoteViaRuntimeClient\b/;
  const runtimeImportPattern =
    /from\s+["']@\/lib\/quote-runtime-integration["']|from\s+["']@\/lib\/quote-runtime["']|from\s+["']@\/lib\/quote-runtime\//;

  const portalBypass = portalFiles.some(
    (content) =>
      directEntryPattern.test(content) ||
      directServicePattern.test(content) ||
      directExecutionPattern.test(content) ||
      runtimeImportPattern.test(content),
  );

  const valid = !legacyInApp && !portalBypass;

  return {
    valid,
    summary: [`legacyInApp=${legacyInApp}`, `portalBypass=${portalBypass}`].join(" "),
  };
}

export function assertNoLegacyPortalLoaderInAppPage(): boolean {
  const appPage = existsSync(getAppQuotesPage()) ? readFileSync(getAppQuotesPage(), "utf8") : "";
  return LEGACY_QUOTE_PORTAL_LOADERS.every((loader) => !appPage.includes(loader));
}

export function assertPortalUiUsesSurfaceOnly(): boolean {
  return checkQuotePortalBypass().valid;
}
