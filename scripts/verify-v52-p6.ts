/**
 * V52 Portal UI — P6 Quote Entry UI verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import { assertWorkspaceApiClientContract } from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  assertQuoteCapabilityOnlyScope,
  assertQuoteEntryUiContract,
  validatePortalP6,
} from "../lib/saas-product-portal/validation/validate-workspace-p6";
import { assertQuoteEntryRegisteredInWorkspaceRegistry } from "../lib/saas-product-portal/quote-entry/quote-entry-registry-extension";
import { assertQuotesNavExistsInWorkspaceNavigation } from "../lib/saas-product-portal/quote-entry/quote-entry-navigation-extension";
import {
  SAAS_PRODUCT_PORTAL_P6_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_META } from "../lib/saas-product-portal/index-meta";
import { SAAS_PRODUCT_PORTAL_P6_FREEZE } from "../lib/saas-product-portal/freeze/v52-p6-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");
const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditQuoteEntryUiExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "pages", "quote-entry-page-content.tsx")) &&
    assertQuoteEntryUiContract()
  );
}

function auditQuoteRouteExists(): boolean {
  const quotePage = join(APP_PORTAL_ROOT, "workspaces", "[id]", "quotes", "page.tsx");
  if (!existsSync(quotePage)) {
    return false;
  }
  const content = readFileSync(quotePage, "utf8");
  return content.includes("QuoteEntryPageContent");
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(PORTAL_ROOT, "pages", "quote-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "quote-entry-header.tsx"),
    join(PORTAL_ROOT, "quote-entry", "quote-entry-registry-extension.ts"),
  ];
  const forbidden = [/searchParams\.get\(\s*["']tenantId["']\s*\)/, /body:\s*\{[^}]*tenantId/];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

async function main() {
  const validation = await validatePortalP6();
  assert(validation.valid, `P6 quote entry validation: ${validation.summary}`);
  console.log("✓ P6 quote entry validation ok");

  assert(auditQuoteEntryUiExists(), "QUOTE_ENTRY_UI_EXISTS");
  console.log("✓ QUOTE_ENTRY_UI_EXISTS");

  assert(auditQuoteRouteExists(), "QUOTE_ROUTE_EXISTS");
  console.log("✓ QUOTE_ROUTE_EXISTS");

  assert(assertQuotesNavExistsInWorkspaceNavigation(), "WORKSPACE_NAVIGATION_QUOTES_EXISTS");
  console.log("✓ WORKSPACE_NAVIGATION_QUOTES_EXISTS");

  assert(assertQuoteEntryRegisteredInWorkspaceRegistry(), "WORKSPACE_REGISTRY_QUOTES_EXISTS");
  console.log("✓ WORKSPACE_REGISTRY_QUOTES_EXISTS");

  assert(assertWorkspaceApiClientContract(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(assertQuoteCapabilityOnlyScope(), "QUOTE_CAPABILITY_ONLY");
  console.log("✓ QUOTE_CAPABILITY_ONLY");

  assert(SAAS_PRODUCT_PORTAL_META.tag === SAAS_PRODUCT_PORTAL_P6_TAG, "portal meta tag");
  assert(SAAS_PRODUCT_PORTAL_META.phase === "v52-portal-ui-p6", "portal meta phase");
  assert(
    SAAS_PRODUCT_PORTAL_P6_FREEZE.routes.includes(`${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/quotes`),
    "quote route meta",
  );
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P6_TAG}`);
  console.log("V52 P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
