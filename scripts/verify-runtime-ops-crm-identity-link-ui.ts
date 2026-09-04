/**
 * WP-RUNTIME-OPS-CRM-IDENTITY-LINK-UI v1 — static verification
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
  console.log("=== WP-RUNTIME-OPS-CRM-IDENTITY-LINK-UI v1 ===\n");

  const control = read("app/(workspace)/WorkspaceOpsCrmIdentityLinkControl.tsx");
  assert(control.includes('"use client"'), "link control is client");
  assert(control.includes("/api/crm/customers"), "loads CRM customers");
  assert(control.includes("/api/runtime-ops/crm-identity/link"), "posts identity link");
  assert(control.includes("opsCustomerId"), "sends opsCustomerId");
  assert(control.includes("crmCustomerId"), "sends crmCustomerId");
  assert(control.includes("router.refresh()"), "refreshes after link");
  assert(control.includes("<select"), "explicit CRM select");
  assert(!control.includes("platform-admin"), "no platform-admin gate");
  assert(!control.includes("findOrCreateCustomer"), "no name matching");
  assert(!control.includes("unlink"), "no unlink in v1");
  console.log("✓ WorkspaceOpsCrmIdentityLinkControl");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(
    panel.includes("WorkspaceOpsCrmIdentityLinkControl"),
    "panel mounts identity link control",
  );
  assert(
    panel.includes("opsCustomerId={item.customerId}"),
    "panel passes ops customer id",
  );
  assert(
    panel.includes("productContext ?") &&
      panel.includes("WorkspaceOpsCrmIdentityLinkControl"),
    "link control only when productContext null branch",
  );
  assert(!panel.includes("platform-admin"), "panel link path not admin-gated");
  console.log("✓ WorkspaceActionSurfacePanel wiring");

  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const adapter = read("lib/product/runtime-ops-product-context-adapter.ts");
  assert(!eads.includes("WorkspaceOpsCrmIdentityLinkControl"), "EADS untouched");
  assert(!eac.includes("WorkspaceOpsCrmIdentityLinkControl"), "EAC untouched");
  assert(!ewas.includes("WorkspaceOpsCrmIdentityLinkControl"), "EWAS untouched");
  assert(!adapter.includes("WorkspaceOpsCrmIdentityLinkControl"), "adapter untouched");
  console.log("✓ frozen layers / adapter untouched");

  console.log("\nSTATUS: PASS");
}

main();
