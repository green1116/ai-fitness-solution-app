/**
 * V52 Portal UI — P4 Workspace Deepening verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import {
  assertWorkspaceDeepeningClientContract,
  validatePortalP4,
} from "../lib/saas-product-portal/validation/validate-workspace-p4";
import { assertWorkspaceApiClientContract } from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  SAAS_PRODUCT_PORTAL_P4_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P4_FREEZE } from "../lib/saas-product-portal/freeze/v52-p4-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");
const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditWorkspaceRouteExists(): boolean {
  return (
    existsSync(join(APP_PORTAL_ROOT, "workspaces", "page.tsx")) &&
    existsSync(join(APP_PORTAL_ROOT, "workspaces", "[id]", "page.tsx"))
  );
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(PORTAL_ROOT, "client", "workspace-api-client.ts"),
    join(PORTAL_ROOT, "components", "workspace-create-form-enhanced.tsx"),
    join(PORTAL_ROOT, "hooks", "use-workspace-list.ts"),
    join(PORTAL_ROOT, "pages", "workspaces-list-page-content.tsx"),
  ];
  const forbidden = [/searchParams\.get\(\s*["']tenantId["']\s*\)/, /body:\s*\{[^}]*tenantId/];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

function auditPortalSessionRequired(): boolean {
  const layout = readFileSync(join(APP_PORTAL_ROOT, "layout.tsx"), "utf8");
  return layout.includes("requirePortalSession");
}

function auditWorkspaceDeepeningOnly(): boolean {
  const forbiddenRoutes = [
    join(APP_PORTAL_ROOT, "commercial"),
    join(APP_PORTAL_ROOT, "quotes"),
    join(APP_PORTAL_ROOT, "workflows"),
  ];
  if (forbiddenRoutes.some((route) => existsSync(route))) {
    return false;
  }

  const required = [
    join(PORTAL_ROOT, "workspace", "workspace-list-utils.ts"),
    join(PORTAL_ROOT, "hooks", "use-workspace-list.ts"),
    join(PORTAL_ROOT, "hooks", "use-workspace-detail.ts"),
    join(PORTAL_ROOT, "components", "workspace-status-actions.tsx"),
    join(PORTAL_ROOT, "validation", "validate-workspace-p4.ts"),
  ];

  return (
    required.every((file) => existsSync(file)) &&
    assertWorkspaceDeepeningClientContract() &&
    readFileSync(join(PORTAL_ROOT, "pages", "workspaces-list-page-content.tsx"), "utf8").includes("useWorkspaceList")
  );
}

async function main() {
  const validation = await validatePortalP4();
  assert(validation.valid, `P4 workspace deepening validation: ${validation.summary}`);
  console.log("✓ P4 workspace deepening validation ok");

  assert(auditWorkspaceRouteExists(), "WORKSPACE_ROUTE_EXISTS");
  console.log("✓ WORKSPACE_ROUTE_EXISTS");

  assert(assertWorkspaceApiClientContract() && assertWorkspaceDeepeningClientContract(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(auditPortalSessionRequired(), "PORTAL_SESSION_REQUIRED");
  console.log("✓ PORTAL_SESSION_REQUIRED");

  assert(auditWorkspaceDeepeningOnly(), "WORKSPACE_DEEPENING_ONLY");
  console.log("✓ WORKSPACE_DEEPENING_ONLY");

  assert(SAAS_PRODUCT_PORTAL_P4_FREEZE.tag === SAAS_PRODUCT_PORTAL_P4_TAG, "P4 freeze tag");
  assert(SAAS_PRODUCT_PORTAL_P4_FREEZE.routes.includes(SAAS_PRODUCT_PORTAL_WORKSPACES_PATH), "workspace route meta");
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P4_TAG}`);
  console.log("V52 P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
