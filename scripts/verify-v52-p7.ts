/**
 * V52 Portal UI — P7 Project Entry UI verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import { assertWorkspaceApiClientContract } from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  assertProjectCapabilityOnlyScope,
  assertProjectEntryUiContract,
  validatePortalP7,
} from "../lib/saas-product-portal/validation/validate-workspace-p7";
import { assertProjectEntryRegisteredInWorkspaceRegistry } from "../lib/saas-product-portal/project-entry/project-entry-registry-extension";
import { assertProjectsNavExistsInWorkspaceNavigation } from "../lib/saas-product-portal/project-entry/project-entry-navigation-extension";
import {
  SAAS_PRODUCT_PORTAL_P7_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P7_FREEZE } from "../lib/saas-product-portal/freeze/v52-p7-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");
const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditProjectEntryUiExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "pages", "project-entry-page-content.tsx")) &&
    assertProjectEntryUiContract()
  );
}

function auditProjectRouteExists(): boolean {
  const projectPage = join(APP_PORTAL_ROOT, "workspaces", "[id]", "projects", "page.tsx");
  if (!existsSync(projectPage)) {
    return false;
  }
  const content = readFileSync(projectPage, "utf8");
  return content.includes("ProjectEntryPageContent");
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(PORTAL_ROOT, "pages", "project-entry-page-content.tsx"),
    join(PORTAL_ROOT, "components", "project-entry-header.tsx"),
    join(PORTAL_ROOT, "project-entry", "project-entry-registry-extension.ts"),
  ];
  const forbidden = [/searchParams\.get\(\s*["']tenantId["']\s*\)/, /body:\s*\{[^}]*tenantId/];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

async function main() {
  const validation = await validatePortalP7();
  assert(validation.valid, `P7 project entry validation: ${validation.summary}`);
  console.log("✓ P7 project entry validation ok");

  assert(auditProjectEntryUiExists(), "PROJECT_ENTRY_UI_EXISTS");
  console.log("✓ PROJECT_ENTRY_UI_EXISTS");

  assert(auditProjectRouteExists(), "PROJECT_ROUTE_EXISTS");
  console.log("✓ PROJECT_ROUTE_EXISTS");

  assert(assertProjectsNavExistsInWorkspaceNavigation(), "WORKSPACE_NAVIGATION_PROJECTS_EXISTS");
  console.log("✓ WORKSPACE_NAVIGATION_PROJECTS_EXISTS");

  assert(assertProjectEntryRegisteredInWorkspaceRegistry(), "WORKSPACE_REGISTRY_PROJECTS_EXISTS");
  console.log("✓ WORKSPACE_REGISTRY_PROJECTS_EXISTS");

  assert(assertWorkspaceApiClientContract(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(assertProjectCapabilityOnlyScope(), "PROJECT_CAPABILITY_ONLY");
  console.log("✓ PROJECT_CAPABILITY_ONLY");

  assert(SAAS_PRODUCT_PORTAL_P7_FREEZE.tag === SAAS_PRODUCT_PORTAL_P7_TAG, "P7 freeze tag");
  assert(SAAS_PRODUCT_PORTAL_P7_FREEZE.status === "project-entry-ui", "P7 freeze status");
  assert(
    SAAS_PRODUCT_PORTAL_P7_FREEZE.routes.includes(`${SAAS_PRODUCT_PORTAL_WORKSPACES_PATH}/[id]/projects`),
    "project route meta",
  );
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P7_TAG}`);
  console.log("V52 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
