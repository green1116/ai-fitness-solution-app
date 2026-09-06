/**
 * WP-RUNTIME-OPS-TENANT-HISTORY-UI-1 — static verification
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

function checkLoad() {
  const src = read("app/(workspace)/load-tenant-ops-history.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("listTenantOpsHistory"), "calls history reader");
  assert(src.includes("take: 10"), "take=10");
  assert(src.includes("resolveTenantOpsOrgContext"), "org membership gate");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(!src.includes("isTenantOpsRoleAllowed"), "read path no mutate role gate");
  assert(!src.includes("runTenantOpsReviewAction"), "no REVIEW");
  assert(!src.includes("completeTenantOpsRecovery"), "no RECOVER");
  assert(!src.includes("runTenantOpsExecuteAction"), "no EXECUTE");
  console.log("✓ load-tenant-ops-history");
}

function checkControl() {
  const src = read("app/(workspace)/TenantOpsHistoryControl.tsx");
  assert(src.includes('"use client"'), "client control");
  assert(src.includes("loadTenantOpsHistory"), "lazy load action");
  assert(src.includes("useWorkspaceOrganizationId"), "org from provider");
  assert(src.includes("customerId"), "customerId prop");
  assert(src.includes("itemId"), "itemId prop");
  assert(src.includes("loaded"), "loads once after expand");
  assert(!src.includes("@/lib/prisma"), "no prisma import");
  assert(!src.includes("listTenantOpsHistory"), "no direct history reader import");
  assert(
    !src.includes("@/lib/runtime-ops/tenant-ops-history"),
    "no history module value import",
  );
  console.log("✓ TenantOpsHistoryControl");
}

function checkPanel() {
  const src = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(src.includes("TenantOpsHistoryControl"), "panel mounts history");
  assert(src.includes("customerId={item.customerId}"), "passes customerId");
  assert(src.includes("itemId={item.id}"), "passes itemId");
  assert(src.includes("TenantOpsReviewActionControl"), "REVIEW control retained");
  assert(src.includes("submitTenantOpsReviewAction"), "REVIEW submit retained");
  assert(!src.includes("listTenantOpsHistory"), "panel does not eager-load history");
  console.log("✓ panel wiring");
}

function checkActionsUnchanged() {
  const review = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(review.includes("EXECUTE"), "EXECUTE retained");
  assert(review.includes("REVIEW"), "REVIEW retained");
  assert(review.includes("RECOVER"), "RECOVER retained");
  assert(!review.includes("TenantOpsHistoryControl"), "actions control not mixed");
  console.log("✓ REVIEW/RECOVER/EXECUTE unchanged");
}

function checkFrozen() {
  const files = [
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("TenantOpsHistoryControl"), `${file} untouched`);
    assert(!src.includes("loadTenantOpsHistory"), `${file} untouched`);
  }
  console.log("✓ frozen untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-HISTORY-UI-1 ===\n");
  checkLoad();
  checkControl();
  checkPanel();
  checkActionsUnchanged();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
