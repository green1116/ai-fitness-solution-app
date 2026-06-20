/**
 * V52 Portal UI — P5 Workspace Product Capability Foundation verification
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runPortalBoundaryAudit } from "../lib/saas-product-portal/validation/validate-portal-p1";
import { assertWorkspaceApiClientContract } from "../lib/saas-product-portal/validation/validate-workspace-p3";
import {
  assertWorkspaceCapabilityOnlyScope,
  assertWorkspaceContextContract,
  validatePortalP5,
} from "../lib/saas-product-portal/validation/validate-workspace-p5";
import { WORKSPACE_PRODUCT_ENTRY_REGISTRY } from "../lib/saas-product-portal/workspace-capability/workspace-entry-registry";
import {
  SAAS_PRODUCT_PORTAL_P5_TAG,
  SAAS_PRODUCT_PORTAL_WORKSPACES_PATH,
} from "../lib/saas-product-portal/shared/portal-constants";
import { SAAS_PRODUCT_PORTAL_P5_FREEZE } from "../lib/saas-product-portal/freeze/v52-p5-meta";

const APP_PORTAL_ROOT = join(process.cwd(), "app", "saas-product");
const PORTAL_ROOT = join(process.cwd(), "lib", "saas-product-portal");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function auditWorkspaceContextExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "workspace-capability", "workspace-context-provider.tsx")) &&
    existsSync(join(PORTAL_ROOT, "hooks", "use-workspace-context.ts")) &&
    existsSync(join(PORTAL_ROOT, "hooks", "use-workspace-refresh.ts")) &&
    assertWorkspaceContextContract()
  );
}

function auditWorkspaceDashboardExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "components", "workspace-dashboard-overview.tsx")) &&
    readFileSync(join(PORTAL_ROOT, "pages", "workspace-overview-page-content.tsx"), "utf8").includes(
      "WorkspaceDashboardOverview",
    )
  );
}

function auditWorkspaceEntryRegistryExists(): boolean {
  return (
    existsSync(join(PORTAL_ROOT, "workspace-capability", "workspace-entry-registry.ts")) &&
    WORKSPACE_PRODUCT_ENTRY_REGISTRY.length >= 4
  );
}

function auditNoDirectTenantAccess(): boolean {
  const files = [
    join(PORTAL_ROOT, "workspace-capability", "workspace-context-provider.tsx"),
    join(PORTAL_ROOT, "pages", "workspace-overview-page-content.tsx"),
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

async function main() {
  const validation = await validatePortalP5();
  assert(validation.valid, `P5 workspace capability validation: ${validation.summary}`);
  console.log("✓ P5 workspace capability validation ok");

  assert(auditWorkspaceContextExists(), "WORKSPACE_CONTEXT_EXISTS");
  console.log("✓ WORKSPACE_CONTEXT_EXISTS");

  assert(auditWorkspaceDashboardExists(), "WORKSPACE_DASHBOARD_EXISTS");
  console.log("✓ WORKSPACE_DASHBOARD_EXISTS");

  assert(auditWorkspaceEntryRegistryExists(), "WORKSPACE_ENTRY_REGISTRY_EXISTS");
  console.log("✓ WORKSPACE_ENTRY_REGISTRY_EXISTS");

  assert(assertWorkspaceApiClientContract(), "WORKSPACE_API_ONLY");
  console.log("✓ WORKSPACE_API_ONLY");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoDirectTenantAccess(), "NO_DIRECT_TENANT_ACCESS");
  console.log("✓ NO_DIRECT_TENANT_ACCESS");

  assert(assertWorkspaceCapabilityOnlyScope(), "WORKSPACE_CAPABILITY_ONLY");
  console.log("✓ WORKSPACE_CAPABILITY_ONLY");

  assert(auditPortalSessionRequired(), "PORTAL_SESSION_REQUIRED");
  console.log("✓ PORTAL_SESSION_REQUIRED");

  assert(SAAS_PRODUCT_PORTAL_P5_FREEZE.tag === SAAS_PRODUCT_PORTAL_P5_TAG, "P5 freeze tag");
  assert(SAAS_PRODUCT_PORTAL_P5_FREEZE.status === "capability-foundation", "P5 freeze status");
  assert(SAAS_PRODUCT_PORTAL_P5_FREEZE.routes.includes(SAAS_PRODUCT_PORTAL_WORKSPACES_PATH), "workspace routes");
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P5_TAG}`);
  console.log("V52 P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
