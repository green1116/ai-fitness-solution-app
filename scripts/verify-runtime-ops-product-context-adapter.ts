/**
 * WP-RUNTIME-OPS-PCX-ADAPTER-1 — Runtime Ops Product Context sidecar verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  resolveCrmCustomerIdForOpsCustomer,
  resolveValidatedProductContextForOpsCustomer,
} from "../lib/product/runtime-ops-product-context-adapter";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkAdapterModule() {
  const src = read("lib/product/runtime-ops-product-context-adapter.ts");
  assert(
    src.includes("export async function resolveValidatedProductContextForOpsCustomer"),
    "ops adapter exported",
  );
  assert(
    src.includes("export async function resolveCrmCustomerIdForOpsCustomer"),
    "ops mapping hook exported",
  );
  assert(
    src.includes("resolveValidatedProductContextForCustomer"),
    "ops adapter reuses validated CRM resolver",
  );
  assert(!src.includes("action-delivery"), "adapter not coupled to EADS");
  assert(!src.includes("action-consumption"), "adapter not coupled to EAC");
  assert(!src.includes("workspace-action-surface"), "adapter not coupled to EWAS");
  assert(!src.includes("writeStoredProductContext"), "adapter does not write session");
  console.log("✓ runtime ops product context adapter module");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const workspace = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(!eads.includes("runtime-ops-product-context-adapter"), "EADS untouched");
  assert(!eac.includes("runtime-ops-product-context-adapter"), "EAC untouched");
  assert(!ewas.includes("runtime-ops-product-context-adapter"), "EWAS untouched");
  assert(!workspace.includes("runtime-ops-product-context-adapter"), "workspace UI untouched");
  console.log("✓ frozen runtime ops layers untouched");
}

async function checkV1MappingReturnsNull() {
  const mapping = await resolveCrmCustomerIdForOpsCustomer("org1", "cust-pg21-alpha");
  assert(mapping === null, "v1 ops mapping returns null");

  const ctx = await resolveValidatedProductContextForOpsCustomer("org1", "cust-pg21-alpha");
  assert(ctx === null, "v1 ops resolver returns null without mapping");

  assert(
    (await resolveValidatedProductContextForOpsCustomer("", "cust-pg21-alpha")) === null,
    "empty organizationId returns null",
  );
  assert(
    (await resolveValidatedProductContextForOpsCustomer("org1", "")) === null,
    "empty opsCustomerId returns null",
  );
  console.log("✓ v1 ops customer mapping returns null");
}

async function main() {
  checkAdapterModule();
  checkFrozenLayersUntouched();
  await checkV1MappingReturnsNull();
  console.log("\n✓ WP-RUNTIME-OPS-PCX-ADAPTER-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
