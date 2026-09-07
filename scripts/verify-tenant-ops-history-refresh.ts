/**
 * WP-TENANT-OPS-HISTORY-REFRESH-1 — static verification
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

function checkHistoryControl() {
  const src = read("app/(workspace)/TenantOpsHistoryControl.tsx");
  assert(src.includes('"use client"'), "client control");
  assert(src.includes("loadTenantOpsHistory"), "uses existing loader");
  assert(src.includes("refreshEpoch"), "mutation stale epoch");
  assert(src.includes("setLoaded(false)"), "resets loaded stale state");
  assert(src.includes("loadHistory"), "re-fetch helper");
  assert(
    src.includes("Close marks cache stale") ||
      src.includes("setLoaded(false)"),
    "reopen path resets/refetches",
  );
  assert(!src.includes("@/lib/prisma"), "no prisma");
  assert(!src.includes("listTenantOpsHistory"), "no direct history reader");
  assert(!src.includes("appendTenantOpsAudit"), "no audit write");
  assert(!src.includes("opportunity.update"), "no mutation");
  console.log("✓ TenantOpsHistoryControl refresh");
}

function checkBridge() {
  const src = read("app/(workspace)/TenantOpsItemSideControls.tsx");
  assert(src.includes('"use client"'), "client bridge");
  assert(src.includes("historyEpoch"), "epoch state");
  assert(src.includes("onMutationSuccess"), "wires mutation success");
  assert(src.includes("refreshEpoch={historyEpoch}"), "passes epoch to history");
  assert(src.includes("TenantOpsReviewActionControl"), "actions retained");
  assert(src.includes("TenantOpsHistoryControl"), "history retained");
  console.log("✓ TenantOpsItemSideControls bridge");
}

function checkReviewCallback() {
  const src = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(src.includes("onMutationSuccess"), "optional success callback");
  assert(
    src.includes("onMutationSuccessRef.current?.()") ||
      src.includes("onMutationSuccess?.()"),
    "invokes on SUCCESS",
  );
  assert(src.includes("router.refresh()"), "refresh retained");
  assert(!src.includes("TenantOpsHistoryControl"), "actions not mixed with history");
  assert(!src.includes("loadTenantOpsHistory"), "no history loader in actions");
  console.log("✓ ReviewActionControl callback only");
}

function checkPanel() {
  const src = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(src.includes("TenantOpsItemSideControls"), "panel mounts bridge");
  assert(src.includes("customerId={item.customerId}"), "passes customerId");
  assert(src.includes("itemId={item.id}"), "passes itemId");
  assert(!src.includes("listTenantOpsHistory"), "panel does not eager-load history");
  console.log("✓ panel wiring");
}

function checkLoaderUnchanged() {
  const src = read("app/(workspace)/load-tenant-ops-history.ts");
  assert(src.includes("listTenantOpsHistory"), "loader retained");
  assert(src.includes("take: 10"), "take=10 retained");
  assert(!src.includes("refreshEpoch"), "loader has no UI refresh semantics");
  console.log("✓ load-tenant-ops-history unchanged contract");
}

function checkFrozen() {
  const files = [
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/runtime-ops/tenant-ops-history.ts",
    "lib/runtime-ops/tenant-ops-audit.ts",
    "lib/runtime-ops/tenant-ops-open-deal.ts",
    "lib/runtime-ops/tenant-ops-close-won.ts",
    "lib/runtime-ops/tenant-ops-close-lost.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("refreshEpoch"), `${file} untouched`);
    assert(!src.includes("TenantOpsItemSideControls"), `${file} untouched`);
  }
  console.log("✓ frozen / deal / audit untouched");
}

function main() {
  console.log("=== WP-TENANT-OPS-HISTORY-REFRESH-1 ===\n");
  checkHistoryControl();
  checkBridge();
  checkReviewCallback();
  checkPanel();
  checkLoaderUnchanged();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
