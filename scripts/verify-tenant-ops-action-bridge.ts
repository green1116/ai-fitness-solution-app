/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-ACTION-1 — bridge verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  parseTenantOpsOpportunityItemId,
  TENANT_OPS_REVIEW_ACTION_ID,
  TENANT_OPS_REVIEW_ACTION_VERSION,
} from "../lib/runtime-ops/tenant-ops-action";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkActionModule() {
  const src = read("lib/runtime-ops/tenant-ops-action.ts");
  assert(src.includes("export async function runTenantOpsReviewAction"), "runTenantOpsReviewAction exported");
  assert(src.includes("deriveTenantReviewEligible"), "uses local reviewEligible");
  assert(src.includes("organization-mismatch"), "org ownership check");
  assert(src.includes("prisma.opportunity.findUnique"), "loads opportunity");
  assert(src.includes("customer.organizationId"), "org via Customer");
  assert(!src.includes("runWorkspaceReviewAction"), "no EWXR call");
  assert(!src.includes("getActionIntents"), "no EWI");
  assert(!src.includes("getActionExecutionRequests"), "no EWEB");
  assert(!src.includes("executeControlledAction"), "no EWER");
  assert(!src.includes("completeWorkspaceReviewRecovery"), "no recovery");
  assert(!src.includes("listWorkspaceReviewSurfaceItemIds"), "no frozen review ids");
  assert(!src.includes("from \"../action-intent"), "no action-intent import");
  assert(!src.includes("action-execution"), "no action-execution import");
  assert(!src.includes("workspace-review-action"), "no workspace-review-action import");
  assert(src.includes(TENANT_OPS_REVIEW_ACTION_ID), "action id");
  assert(src.includes(TENANT_OPS_REVIEW_ACTION_VERSION), "action version");
  console.log("✓ tenant-ops-action module");
}

function checkParse() {
  assert(
    parseTenantOpsOpportunityItemId("crm:opportunity:abc123") === "abc123",
    "parses opportunity id",
  );
  assert(parseTenantOpsOpportunityItemId("eac-1:foo") === null, "rejects frozen id");
  assert(parseTenantOpsOpportunityItemId("") === null, "rejects empty");
  console.log("✓ item id parse");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-review-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("runTenantOpsReviewAction"), "calls tenant action");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes('formData.get("itemId")'), "reads itemId");
  assert(!src.includes("runWorkspaceReviewAction"), "submit skips EWXR");
  assert(!src.includes("getActionIntents"), "submit skips EWI");
  assert(!src.includes("executeControlledAction"), "submit skips EWER");
  assert(!src.includes("completeWorkspaceReviewRecovery"), "no recovery v1");
  console.log("✓ submit-tenant-ops-review-action");
}

function checkControl() {
  const src = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(src.includes('"use client"'), "client control");
  assert(src.includes("itemId"), "passes itemId");
  assert(src.includes("REVIEW"), "REVIEW button");
  assert(!src.includes("RECOVER"), "no recovery control");
  assert(!src.includes("surfaceItemId"), "no frozen surfaceItemId");
  assert(!src.includes("submitWorkspaceReview"), "no frozen submit");
  console.log("✓ TenantOpsReviewActionControl");
}

function checkPanelWiring() {
  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("TenantOpsReviewActionControl"), "tenant control mounted");
  assert(panel.includes("submitTenantOpsReviewAction"), "tenant submit wired");
  assert(panel.includes("item.reviewEligible"), "gated by reviewEligible");
  assert(panel.includes("WorkspaceReviewActionControl"), "frozen REVIEW control retained");
  assert(panel.includes("submitWorkspaceReviewAction"), "frozen submit retained");
  assert(panel.includes("renderFrozenEwasPanel"), "frozen EWAS path retained");

  const tenantRowStart = panel.indexOf("function TenantBacklogItemRow");
  const tenantRowEnd = panel.indexOf("async function renderTenantOpsBacklogPanel");
  assert(tenantRowStart > 0 && tenantRowEnd > tenantRowStart, "tenant row bounds");
  const tenantRow = panel.slice(tenantRowStart, tenantRowEnd);
  assert(tenantRow.includes("TenantOpsReviewActionControl"), "tenant row mounts tenant control");
  assert(
    !tenantRow.includes("WorkspaceReviewActionControl"),
    "tenant rows do not use frozen REVIEW control",
  );
  console.log("✓ panel wiring");
}

function checkFrozenUntouched() {
  const forbidden = [
    "runTenantOpsReviewAction",
    "tenant-ops-action",
    "TenantOpsReviewActionControl",
    "submitTenantOpsReviewAction",
  ];
  const files = [
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/action-execution/workspace-review-action.ts",
    "lib/commercial/action-execution/review-recovery.ts",
    "app/(workspace)/WorkspaceReviewActionControl.tsx",
    "app/(workspace)/submit-workspace-review-action.ts",
    "app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx",
  ];
  for (const file of files) {
    const src = read(file);
    for (const token of forbidden) {
      assert(!src.includes(token), `${file} must not reference ${token}`);
    }
  }
  console.log("✓ frozen / CRM admin / frozen REVIEW path untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-REVIEW-ACTION-1 ===\n");
  checkActionModule();
  checkParse();
  checkSubmit();
  checkControl();
  checkPanelWiring();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
