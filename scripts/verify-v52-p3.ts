/**
 * V52 Portal UI — P3 Workspace UI Foundation verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import {
  assertWorkspaceApiClientContract,
  validatePortalP3,
} from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  SAAS_PRODUCT_PORTAL_P3_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P3_FREEZE } from "../lib/saas-product-portal/freeze/v52-p3-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditWorkspaceRouteExists(): boolean {
  return (
    existsSync(join(APP_PORTAL_ROOT, "workspaces", "page.tsx")) &&
    existsSync(join(APP_PORTAL_ROOT, "workspaces", "[id]", "page.tsx"))
  );
}

function auditWorkspaceApiOnly(): boolean {
  return assertWorkspaceApiClientContract();
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(APP_PORTAL_ROOT, "workspaces", "page.tsx"),
    join(APP_PORTAL_ROOT, "workspaces", "[id]", "page.tsx"),
    join(process.cwd(), "lib", "saas-product-portal", "client", "workspace-api-client.ts"),
    join(process.cwd(), "lib", "saas-product-portal", "components", "workspace-create-form.tsx"),
  ];
  const forbidden = [/searchParams\.get\(\s*["']tenantId["']\s*\)/, /tenantId\s*:\s*input/, /body:\s*\{\s*name:[^}]*tenantId/];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}

function auditPortalSessionRequired(): boolean {
  const layout = readFileSync(join(APP_PORTAL_ROOT, "layout.tsx"), "utf8");
  return layout.includes("requirePortalSession");
}

async function main() {
  const validation = await validatePortalP3();
  assert(validation.valid, `P3 workspace validation: ${validation.summary}`);
  console.log("✓ P3 workspace API validation ok");

  assert(auditWorkspaceRouteExists(), "WORKSPACE_ROUTE_EXISTS");
  console.log("✓ WORKSPACE_ROUTE_EXISTS");

  assert(auditWorkspaceApiOnly(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(audit.PORTAL_NO_V49_V50, "NO_V49_V50");
  console.log("✓ NO_V49_V50");

  assert(auditPortalSessionRequired(), "PORTAL_SESSION_REQUIRED");
  console.log("✓ PORTAL_SESSION_REQUIRED");

  assert(SAAS_PRODUCT_PORTAL_P3_FREEZE.tag === SAAS_PRODUCT_PORTAL_P3_TAG, "P3 freeze tag");
  assert(SAAS_PRODUCT_PORTAL_P3_FREEZE.routes.includes(SAAS_PRODUCT_PORTAL_WORKSPACES_PATH), "workspace route meta");
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P3_TAG}`);
  console.log("V52 P3 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
