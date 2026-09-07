/**
 * WP-RUNTIME-OPS-TENANT-CLOSE-WON-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  isTenantOpsCloseWonEligible,
  TENANT_OPS_CLOSE_WON_ID,
  TENANT_OPS_CLOSE_WON_VERSION,
} from "../lib/runtime-ops/tenant-ops-close-won";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkModule() {
  const src = read("lib/runtime-ops/tenant-ops-close-won.ts");
  assert(src.includes("export async function runTenantOpsCloseWonAction"), "run exported");
  assert(src.includes("closeDealWon"), "uses closeDealWon");
  assert(
    !/import\s*\{[^}]*closeDealLost/.test(src) &&
      !src.includes("closeDealLost("),
    "no closeDealLost call/import",
  );
  assert(
    !/import\s*\{[^}]*closePipelineLost/.test(src) &&
      !src.includes("closePipelineLost("),
    "no closePipelineLost",
  );
  assert(src.includes("deal-already-closed-won"), "idempotent reason");
  assert(src.includes("not-close-won-eligible"), "NEGOTIATION gate");
  assert(src.includes("no-open-deal"), "OPEN deal required");
  assert(src.includes("deal-closed-lost"), "blocks closed lost");
  assert(src.includes("deal-cross-terminal"), "blocks cross-terminal");
  assert(src.includes("organization-mismatch"), "ownership");
  assert(src.includes('kind: "close_won"'), "tenant_ops audit");
  assert(src.includes(TENANT_OPS_CLOSE_WON_ID), "id");
  assert(src.includes(TENANT_OPS_CLOSE_WON_VERSION), "version");
  assert(isTenantOpsCloseWonEligible("NEGOTIATION"), "NEGOTIATION eligible");
  assert(!isTenantOpsCloseWonEligible("PROPOSAL"), "PROPOSAL not eligible");
  assert(!isTenantOpsCloseWonEligible("WON"), "WON not UI-eligible");
  console.log("✓ tenant-ops-close-won module");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-close-won-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("runTenantOpsCloseWonAction"), "calls close won");
  assert(src.includes("resolveTenantOpsOrgContext"), "org gate");
  assert(src.includes("isTenantOpsRoleAllowed"), "role gate");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes('revalidatePath("/projects", "layout")'), "revalidate on SUCCESS");
  console.log("✓ submit-tenant-ops-close-won-action");
}

function checkControlAndPanel() {
  const control = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(control.includes("CLOSE WON"), "CLOSE WON button");
  assert(control.includes("submitTenantOpsCloseWonAction"), "close won submit");
  assert(control.includes("closeWonEligible"), "closeWonEligible prop");
  assert(control.includes("OPEN DEAL"), "OPEN DEAL retained");
  assert(control.includes("EXECUTE"), "EXECUTE retained");
  assert(control.includes("REVIEW"), "REVIEW retained");
  assert(control.includes("RECOVER"), "RECOVER retained");
  assert(
    !control.includes("@/lib/runtime-ops/tenant-ops-close-won"),
    "control does not value-import close-won module",
  );
  assert(!control.includes("@/lib/prisma"), "no prisma in control");
  assert(control.includes("CLOSE LOST"), "CLOSE LOST coexists");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("isTenantOpsCloseWonEligible"), "panel eligibility");
  assert(
    panel.includes("closeWonEligible={isTenantOpsCloseWonEligible(item.stage)}"),
    "passes closeWonEligible",
  );
  console.log("✓ control + panel");
}

function checkAuditHistoryFailure() {
  const audit = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(audit.includes('close_won: "tenant_ops.close_won"'), "audit type");
  const history = read("lib/runtime-ops/tenant-ops-history.ts");
  assert(history.includes("TENANT_OPS_AUDIT_TYPES.close_won"), "history includes close_won");
  const failure = read("lib/runtime-ops/tenant-ops-failure.ts");
  assert(failure.includes('"not-close-won-eligible"'), "failure terminal eligible");
  assert(failure.includes('"no-open-deal"'), "failure terminal no-open-deal");
  assert(failure.includes('"deal-closed-lost"'), "failure terminal closed-lost");
  assert(failure.includes('"deal-cross-terminal"'), "failure terminal cross");
  console.log("✓ audit + history + failure");
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
    assert(!src.includes("runTenantOpsCloseWonAction"), `${file} untouched`);
    assert(!src.includes("tenant-ops-close-won"), `${file} untouched`);
  }
  console.log("✓ frozen / pipeline untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-CLOSE-WON-1 ===\n");
  checkModule();
  checkSubmit();
  checkControlAndPanel();
  checkAuditHistoryFailure();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
