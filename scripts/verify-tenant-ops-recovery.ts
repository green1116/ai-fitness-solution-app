/**
 * WP-RUNTIME-OPS-TENANT-REVIEW-RECOVERY-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TENANT_OPS_RECOVERY_ID,
  TENANT_OPS_RECOVERY_VERSION,
} from "../lib/runtime-ops/tenant-ops-recovery";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkRecoveryModule() {
  const src = read("lib/runtime-ops/tenant-ops-recovery.ts");
  assert(
    src.includes("export async function completeTenantOpsRecovery"),
    "completeTenantOpsRecovery exported",
  );
  assert(
    src.includes("export async function listTenantOpsRecoveredItemIds"),
    "listTenantOpsRecoveredItemIds exported",
  );
  assert(src.includes("surfaceItemId: { in: ids }"), "batch recovery query");
  assert(src.includes("prisma.workspaceReviewRecovery"), "persists via WorkspaceReviewRecovery");
  assert(src.includes("surfaceItemId: itemId"), "stores tenant itemId in surfaceItemId slot");
  assert(src.includes("organization-mismatch"), "org ownership check");
  assert(src.includes("parseTenantOpsOpportunityItemId"), "parses tenant item id");
  assert(src.includes("deriveTenantReviewEligible"), "local eligibility");
  assert(!/\bcompleteWorkspaceReviewRecovery\b/.test(src), "no frozen recovery call");
  assert(!/\bgetActionIntents\b/.test(src), "no EWI");
  assert(!/\bgetCustomerSuccessReview\b/.test(src), "no ESCS");
  assert(!/\bgetActionExecutionRequests\b/.test(src), "no EWEB");
  assert(!/\bexecuteControlledAction\b/.test(src), "no EWER");
  assert(!/\brunWorkspaceReviewAction\b/.test(src), "no EWXR");
  assert(!src.includes('from "@/lib/commercial/action-intent'), "no action-intent import");
  assert(!src.includes("customer-success-review"), "no ESCS import");
  assert(!src.includes('from "@/lib/commercial/action-execution/review-recovery'), "does not import review-recovery.ts");
  assert(!src.includes('from "../commercial/action-execution/review-recovery'), "does not import review-recovery relative");
  assert(src.includes(TENANT_OPS_RECOVERY_ID), "recovery id");
  assert(src.includes(TENANT_OPS_RECOVERY_VERSION), "recovery version");
  console.log("✓ tenant-ops-recovery module");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-recovery-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("completeTenantOpsRecovery"), "calls tenant recovery");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes("userId: gate.tenant.userId"), "passes session userId");
  assert(!src.includes('formData.get("userId")'), "never trusts client userId");
  assert(src.includes('formData.get("itemId")'), "reads itemId");
  assert(src.includes('revalidatePath("/projects", "layout")'), "revalidates workspace layout on SUCCESS");
  assert(src.includes('result.result === "SUCCESS"'), "revalidate only on SUCCESS");
  assert(!src.includes("completeWorkspaceReviewRecovery"), "no frozen recovery");
  assert(!src.includes("getActionIntents"), "no EWI");
  assert(!src.includes("getCustomerSuccessReview"), "no ESCS");
  console.log("✓ submit-tenant-ops-recovery-action");
}

function checkControl() {
  const src = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(src.includes("REVIEW"), "REVIEW retained");
  assert(src.includes("submitReviewAction"), "REVIEW submit prop unchanged");
  assert(src.includes("RECOVER"), "RECOVER button");
  assert(src.includes("submitTenantOpsRecoveryAction"), "tenant recovery submit");
  assert(src.includes("recovered"), "accepts persisted recovered prop");
  assert(src.includes("isRecovered = recovered || recoveryState?.result === \"SUCCESS\""), "persisted + session recovered");
  assert(
    src.includes("showReview && reviewState?.result === \"SUCCESS\" && !isRecovered"),
    "RECOVER after REVIEW SUCCESS when not recovered",
  );
  assert(!src.includes("submitWorkspaceReviewRecoveryAction"), "no frozen recovery submit");
  assert(!src.includes("surfaceItemId"), "no frozen surfaceItemId");
  console.log("✓ TenantOpsReviewActionControl recovery wiring");
}

function checkPersistedViewPanel() {
  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("listTenantOpsRecoveredItemIds"), "panel batch-reads recovery");
  assert(panel.includes("recovered={recoveredItemIds.has(item.id)}"), "panel passes recovered");
  assert(!/isTenantOpsRecovered\(/.test(panel), "panel avoids N+1 isTenantOpsRecovered");
  console.log("✓ panel persisted recovery view");
}

function checkReviewPathUntouched() {
  const action = read("lib/runtime-ops/tenant-ops-action.ts");
  assert(action.includes("export async function runTenantOpsReviewAction"), "REVIEW action intact");
  assert(!action.includes("completeTenantOpsRecovery"), "REVIEW module not coupled to recovery");
  const submit = read("app/(workspace)/submit-tenant-ops-review-action.ts");
  assert(submit.includes("runTenantOpsReviewAction"), "REVIEW submit intact");
  assert(!submit.includes("completeTenantOpsRecovery"), "REVIEW submit not coupled");
  console.log("✓ tenant REVIEW path unchanged");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/review-recovery.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/customer-success/customer-success-review.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
    "app/(workspace)/submit-workspace-review-action.ts",
    "app/(workspace)/WorkspaceReviewActionControl.tsx",
  ];
  const forbidden = [
    "completeTenantOpsRecovery",
    "tenant-ops-recovery",
    "submitTenantOpsRecoveryAction",
  ];
  for (const file of files) {
    const src = read(file);
    for (const token of forbidden) {
      assert(!src.includes(token), `${file} must not reference ${token}`);
    }
  }
  console.log("✓ frozen / review-recovery.ts untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-REVIEW-RECOVERY-1 ===\n");
  checkRecoveryModule();
  checkSubmit();
  checkControl();
  checkPersistedViewPanel();
  checkReviewPathUntouched();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
