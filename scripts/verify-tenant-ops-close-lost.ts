/**
 * WP-RUNTIME-OPS-TENANT-CLOSE-LOST-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  isTenantOpsCloseLostEligible,
  TENANT_OPS_CLOSE_LOST_ID,
  TENANT_OPS_CLOSE_LOST_VERSION,
} from "../lib/runtime-ops/tenant-ops-close-lost";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkModule() {
  const src = read("lib/runtime-ops/tenant-ops-close-lost.ts");
  assert(src.includes("export async function runTenantOpsCloseLostAction"), "run exported");
  assert(src.includes("closeDealLost"), "uses closeDealLost");
  assert(
    !/import\s*\{[^}]*closeDealWon/.test(src) &&
      !src.includes("closeDealWon("),
    "no closeDealWon call/import",
  );
  assert(src.includes("deal-already-closed-lost"), "idempotent reason");
  assert(src.includes("not-close-lost-eligible"), "NEGOTIATION gate");
  assert(src.includes("no-open-deal"), "OPEN deal required");
  assert(src.includes("deal-closed-won"), "blocks closed won");
  assert(src.includes("deal-cross-terminal"), "blocks cross-terminal");
  assert(src.includes("organization-mismatch"), "ownership");
  assert(src.includes('kind: "close_lost"'), "tenant_ops audit");
  assert(isTenantOpsCloseLostEligible("NEGOTIATION"), "NEGOTIATION eligible");
  assert(!isTenantOpsCloseLostEligible("PROPOSAL"), "PROPOSAL not eligible");
  assert(!isTenantOpsCloseLostEligible("INIT"), "INIT not eligible");
  assert(!isTenantOpsCloseLostEligible("LOST"), "LOST not UI-eligible");
  assert(src.includes(TENANT_OPS_CLOSE_LOST_ID), "id");
  assert(src.includes(TENANT_OPS_CLOSE_LOST_VERSION), "version");
  console.log("✓ tenant-ops-close-lost module");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-close-lost-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("runTenantOpsCloseLostAction"), "calls close lost");
  assert(src.includes("resolveTenantOpsOrgContext"), "org gate");
  assert(src.includes("isTenantOpsRoleAllowed"), "role gate");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes('revalidatePath("/projects", "layout")'), "revalidate on SUCCESS");
  console.log("✓ submit-tenant-ops-close-lost-action");
}

function checkControlAndPanel() {
  const control = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(control.includes("CLOSE LOST"), "CLOSE LOST button");
  assert(control.includes("submitTenantOpsCloseLostAction"), "close lost submit");
  assert(control.includes("closeLostEligible"), "closeLostEligible prop");
  assert(control.includes("CLOSE WON"), "CLOSE WON retained");
  assert(control.includes("OPEN DEAL"), "OPEN DEAL retained");
  assert(control.includes("EXECUTE"), "EXECUTE retained");
  assert(control.includes("REVIEW"), "REVIEW retained");
  assert(control.includes("RECOVER"), "RECOVER retained");
  assert(
    !control.includes("@/lib/runtime-ops/tenant-ops-close-lost"),
    "control does not value-import close-lost module",
  );
  assert(!control.includes("@/lib/prisma"), "no prisma in control");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("isTenantOpsCloseLostEligible"), "panel eligibility");
  assert(
    panel.includes("closeLostEligible={isTenantOpsCloseLostEligible(item.stage)}"),
    "passes closeLostEligible",
  );
  console.log("✓ control + panel");
}

function checkAuditHistoryFailure() {
  const audit = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(audit.includes('close_lost: "tenant_ops.close_lost"'), "audit type");
  const history = read("lib/runtime-ops/tenant-ops-history.ts");
  assert(history.includes("TENANT_OPS_AUDIT_TYPES.close_lost"), "history includes close_lost");
  const failure = read("lib/runtime-ops/tenant-ops-failure.ts");
  assert(failure.includes('"not-close-lost-eligible"'), "failure terminal eligible");
  assert(failure.includes('"deal-closed-won"'), "failure terminal closed-won");
  console.log("✓ audit + history + failure");
}

function checkNoCloseWonModuleChange() {
  const src = read("lib/runtime-ops/tenant-ops-close-won.ts");
  assert(src.includes("closeDealWon"), "close-won still uses closeDealWon");
  assert(
    !/import\s*\{[^}]*closeDealLost/.test(src) &&
      !src.includes("closeDealLost("),
    "close-won still has no closeDealLost",
  );
  console.log("✓ close-won module untouched contract");
}

function checkFrozen() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/crm/pipeline/crm.pipeline.engine.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("runTenantOpsCloseLostAction"), `${file} untouched`);
    assert(!src.includes("tenant-ops-close-lost"), `${file} untouched`);
  }
  console.log("✓ frozen / pipeline untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-CLOSE-LOST-1 ===\n");
  checkModule();
  checkSubmit();
  checkControlAndPanel();
  checkAuditHistoryFailure();
  checkNoCloseWonModuleChange();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
