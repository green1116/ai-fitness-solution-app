/**
 * WP-RUNTIME-OPS-WORKSPACE-NAVIGATION-PERFORMANCE-1 P0/P1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-WORKSPACE-NAVIGATION-PERFORMANCE-1 P0/P1 ===\n");

  const layout = read("app/(workspace)/layout.tsx");
  assert(layout.includes("listOrganizationsForUser"), "layout resolves org");
  assert(
    layout.includes("organizationId={organizationId}"),
    "layout passes organizationId",
  );
  console.log("✓ layout org once");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(!panel.includes("getCurrentUser"), "panel has no duplicate auth");
  assert(!panel.includes("listOrganizationsForUser"), "panel has no duplicate org lookup");
  assert(
    panel.includes("listOpsCrmIdentityLinksByOpsCustomerIds"),
    "panel batch identity",
  );
  assert(panel.includes("lookupOpsCrmIdentitySeed"), "panel checks seed before PCX");
  assert(
    panel.includes("resolveValidatedProductContextForCustomer"),
    "mapped path uses CRM-id PCX",
  );
  assert(
    !panel.includes("resolveValidatedProductContextForOpsCustomer"),
    "unmapped path skips ops adapter full PCX",
  );
  assert(panel.includes("listCustomers"), "panel lists CRM customers once");
  assert(panel.includes("customers={crmCustomers}"), "customers shared to link controls");
  console.log("✓ panel PCX + customers");

  const control = read("app/(workspace)/WorkspaceOpsCrmIdentityLinkControl.tsx");
  assert(control.includes("/api/runtime-ops/crm-identity/link"), "POST link retained");
  assert(control.includes("router.refresh()"), "refresh retained");
  assert(!control.includes("/api/crm/customers"), "no N× customers fetch");
  assert(!control.includes("/api/auth/me"), "no N× auth/me");
  console.log("✓ link control POST-only");

  const store = read("lib/product/runtime-ops-crm-identity-store.ts");
  assert(
    store.includes("export async function listOpsCrmIdentityLinksByOpsCustomerIds"),
    "batch lookup exported",
  );
  assert(store.includes("findMany"), "batch uses findMany");
  console.log("✓ identity store batch");

  const adapter = read("lib/product/runtime-ops-product-context-adapter.ts");
  const bridge = read("lib/product/commercial-context-bridge.ts");
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  assert(!adapter.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "adapter untouched");
  assert(!bridge.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "bridge untouched");
  assert(!eads.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "EADS untouched");
  assert(!eac.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "EAC untouched");
  assert(!ewas.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "EWAS untouched");
  console.log("✓ frozen boundaries");

  console.log("\nSTATUS: PASS");
}

main();
