/**
 * V52 Portal UI — P8 Report Entry UI verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import { assertWorkspaceApiClientContract } from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  assertReportCapabilityOnlyScope,
  assertReportEntryUiContract,
  validatePortalP8,
} from "../lib/saas-product-portal/validation/validate-workspace-p8";
import { assertReportEntryRegisteredInWorkspaceRegistry } from "../lib/saas-product-portal/report-entry/report-entry-registry-extension";
import { assertReportsNavExistsInWorkspaceNavigation } from "../lib/saas-product-portal/report-entry/report-entry-navigation-extension";
import {
  SAAS_PRODUCT_PORTAL_P8_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_META } from "../lib/saas-product-portal/index-meta";
import { SAAS_PRODUCT_PORTAL_P8_FREEZE } from "../lib/saas-product-portal/freeze/v52-p8-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");
const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditReportEntryUiExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "pages", "report-entry-page-content.tsx")) &&
    assertReportEntryUiContract()
  );
}

function auditReportRouteExists(): boolean {
  const reportPage = join(APP_PORTAL_ROOT, "workspaces", "[id]", "reports", "page.tsx");
  if (!existsSync(reportPage)) {
    return false;
  }
  const content = readFileSync(reportPage, "utf8");
  return content.includes("ReportEntryPageContent");
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(PORTAL_ROOT, "pages", "report-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "report-entry-header.tsx"),
    join(PORTAL_ROOT, "report-entry", "report-entry-registry-extension.ts"),
  ];
  const forbidden = [/searchParams\.get\(\s*["']tenantId["']\s*\)/, /body:\s*\{[^}]*tenantId/];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

async function main() {
  const validation = await validatePortalP8();
  assert(validation.valid, `P8 report entry validation: ${validation.summary}`);
  console.log("✓ P8 report entry validation ok");

  assert(auditReportEntryUiExists(), "REPORT_ENTRY_UI_EXISTS");
  console.log("✓ REPORT_ENTRY_UI_EXISTS");

  assert(auditReportRouteExists(), "REPORT_ROUTE_EXISTS");
  console.log("✓ REPORT_ROUTE_EXISTS");

  assert(assertReportsNavExistsInWorkspaceNavigation(), "WORKSPACE_NAVIGATION_REPORTS_EXISTS");
  console.log("✓ WORKSPACE_NAVIGATION_REPORTS_EXISTS");

  assert(assertReportEntryRegisteredInWorkspaceRegistry(), "WORKSPACE_REGISTRY_REPORTS_EXISTS");
  console.log("✓ WORKSPACE_REGISTRY_REPORTS_EXISTS");

  assert(assertWorkspaceApiClientContract(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(assertReportCapabilityOnlyScope(), "REPORT_CAPABILITY_ONLY");
  console.log("✓ REPORT_CAPABILITY_ONLY");

  assert(SAAS_PRODUCT_PORTAL_META.tag === SAAS_PRODUCT_PORTAL_P8_TAG, "portal meta tag");
  assert(SAAS_PRODUCT_PORTAL_META.phase === "v52-portal-ui-p8", "portal meta phase");
  assert(
    SAAS_PRODUCT_PORTAL_P8_FREEZE.routes.includes(`${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/reports`),
    "report route meta",
  );
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P8_TAG}`);
  console.log("V52 P8 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
