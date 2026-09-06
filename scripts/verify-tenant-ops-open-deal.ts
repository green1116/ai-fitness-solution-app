/**
 * WP-RUNTIME-OPS-TENANT-OPEN-DEAL-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  isTenantOpsOpenDealEligible,
  TENANT_OPS_OPEN_DEAL_ID,
  TENANT_OPS_OPEN_DEAL_VERSION,
} from "../lib/runtime-ops/tenant-ops-open-deal";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkModule() {
  const src = read("lib/runtime-ops/tenant-ops-open-deal.ts");
  assert(src.includes("export async function runTenantOpsOpenDealAction"), "run exported");
  assert(src.includes("openDealForOpportunity"), "uses openDealForOpportunity");
  assert(
    !/import\s*\{[^}]*openDealFromOpportunity/.test(src) &&
      !src.includes("openDealFromOpportunity("),
    "no openDealFromOpportunity call/import",
  );
  assert(!src.includes("createDeal("), "no createDeal direct");
  assert(!src.includes("closeDealWon"), "no close won");
  assert(!src.includes("closeDealLost"), "no close lost");
  assert(!src.includes("opportunity.update"), "no opportunity stage mutation");
  assert(!src.includes("updateMany"), "no stage updateMany");
  assert(src.includes("not-open-deal-eligible"), "NEGOTIATION gate reason");
  assert(src.includes("organization-mismatch"), "ownership");
  assert(src.includes('kind: "open_deal"'), "tenant_ops audit");
  assert(src.includes(TENANT_OPS_OPEN_DEAL_ID), "id");
  assert(src.includes(TENANT_OPS_OPEN_DEAL_VERSION), "version");
  assert(isTenantOpsOpenDealEligible("NEGOTIATION"), "NEGOTIATION eligible");
  assert(!isTenantOpsOpenDealEligible("PROPOSAL"), "PROPOSAL not eligible");
  assert(!isTenantOpsOpenDealEligible("INIT"), "INIT not eligible");
  console.log("✓ tenant-ops-open-deal module");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-open-deal-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("runTenantOpsOpenDealAction"), "calls open deal");
  assert(src.includes("resolveTenantOpsOrgContext"), "org gate");
  assert(src.includes("isTenantOpsRoleAllowed"), "role gate");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes('revalidatePath("/projects", "layout")'), "revalidate on SUCCESS");
  console.log("✓ submit-tenant-ops-open-deal-action");
}

function checkControlAndPanel() {
  const control = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(control.includes("OPEN DEAL"), "OPEN DEAL button");
  assert(control.includes("submitTenantOpsOpenDealAction"), "open deal submit");
  assert(control.includes("openDealEligible"), "openDealEligible prop");
  assert(control.includes("EXECUTE"), "EXECUTE retained");
  assert(control.includes("REVIEW"), "REVIEW retained");
  assert(control.includes("RECOVER"), "RECOVER retained");
  assert(
    !control.includes("@/lib/runtime-ops/tenant-ops-open-deal"),
    "control does not value-import open-deal module",
  );
  assert(!control.includes("@/lib/prisma"), "no prisma in control");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("isTenantOpsOpenDealEligible"), "panel eligibility");
  assert(panel.includes("openDealEligible={isTenantOpsOpenDealEligible(item.stage)}"), "passes openDealEligible");
  console.log("✓ control + panel");
}

function checkAuditHistory() {
  const audit = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(audit.includes('open_deal: "tenant_ops.open_deal"'), "audit type");
  const history = read("lib/runtime-ops/tenant-ops-history.ts");
  assert(history.includes("TENANT_OPS_AUDIT_TYPES.open_deal"), "history includes open_deal");
  console.log("✓ audit + history types");
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
    assert(!src.includes("runTenantOpsOpenDealAction"), `${file} untouched`);
    assert(!src.includes("tenant-ops-open-deal"), `${file} untouched`);
  }
  console.log("✓ frozen / pipeline untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-OPEN-DEAL-1 ===\n");
  checkModule();
  checkSubmit();
  checkControlAndPanel();
  checkAuditHistory();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
