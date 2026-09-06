/**
 * WP-RUNTIME-OPS-TENANT-EXECUTION-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  deriveTenantOpsExecuteTarget,
  isTenantOpsExecuteEligible,
  TENANT_OPS_EXECUTE_ID,
  TENANT_OPS_EXECUTE_VERSION,
} from "../lib/runtime-ops/tenant-ops-execute";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkExecuteModule() {
  const src = read("lib/runtime-ops/tenant-ops-execute.ts");
  assert(src.includes("export async function runTenantOpsExecuteAction"), "runTenantOpsExecuteAction exported");
  assert(src.includes("advanceOpportunityToProposal"), "INIT→PROPOSAL pipeline");
  assert(src.includes("advanceOpportunityToNegotiation"), "PROPOSAL→NEGOTIATION pipeline");
  assert(src.includes("organization-mismatch"), "org ownership");
  assert(src.includes("negotiation-review-only"), "NEGOTIATION blocked");
  assert(src.includes('reason: "idempotent"'), "idempotent SUCCESS path");
  assert(src.includes("liveStage === toStage"), "re-read already-at-target");
  assert(src.includes('reason: "stage-changed"'), "stage-changed when live diverges");
  assert(src.includes('fromStage === "INIT" && toStage === "PROPOSAL"'), "INIT→PROPOSAL only");
  assert(src.includes('fromStage === "PROPOSAL" && toStage === "NEGOTIATION"'), "PROPOSAL→NEGOTIATION only");
  assert(!src.includes("openDealFromOpportunity"), "no deal open v1");
  assert(!src.includes("createDeal"), "no deal create");
  assert(!/\bgetActionExecutionRequests\b/.test(src), "no EWEB");
  assert(!/\bexecuteControlledAction\b/.test(src), "no EWER");
  assert(!/\bgetActionIntents\b/.test(src), "no EWI");
  assert(!src.includes("action-execution"), "no action-execution import");
  assert(src.includes(TENANT_OPS_EXECUTE_ID), "execute id");
  assert(src.includes(TENANT_OPS_EXECUTE_VERSION), "execute version");
  console.log("✓ tenant-ops-execute module");
}

function checkDerivation() {
  assert(deriveTenantOpsExecuteTarget("INIT") === "PROPOSAL", "INIT → PROPOSAL");
  assert(deriveTenantOpsExecuteTarget("PROPOSAL") === "NEGOTIATION", "PROPOSAL → NEGOTIATION");
  assert(deriveTenantOpsExecuteTarget("NEGOTIATION") === null, "NEGOTIATION not executable");
  assert(deriveTenantOpsExecuteTarget("WON") === null, "WON not executable");
  assert(isTenantOpsExecuteEligible("INIT"), "INIT eligible");
  assert(isTenantOpsExecuteEligible("PROPOSAL"), "PROPOSAL eligible");
  assert(!isTenantOpsExecuteEligible("NEGOTIATION"), "NEGOTIATION not eligible");
  console.log("✓ execute target derivation");
}

function checkSubmit() {
  const src = read("app/(workspace)/submit-tenant-ops-execute-action.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("runTenantOpsExecuteAction"), "calls execute");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes('formData.get("itemId")'), "reads itemId");
  assert(src.includes('revalidatePath("/projects", "layout")'), "revalidates workspace layout on SUCCESS");
  assert(src.includes('result.result === "SUCCESS"'), "revalidate only on SUCCESS");
  assert(!/\bexecuteControlledAction\b/.test(src), "no EWER");
  assert(!/\bgetActionExecutionRequests\b/.test(src), "no EWEB");
  console.log("✓ submit-tenant-ops-execute-action");
}

function checkControlAndPanel() {
  const control = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(control.includes("EXECUTE"), "EXECUTE in existing control");
  assert(control.includes("submitTenantOpsExecuteAction"), "execute submit wired");
  assert(control.includes("executeEligible"), "executeEligible prop");
  assert(control.includes("reviewEligible"), "reviewEligible prop");
  assert(
    !control.includes('from "@/lib/runtime-ops/tenant-ops-execute"'),
    "control does not value-import tenant-ops-execute",
  );
  assert(
    !control.includes('from "@/lib/runtime-ops/tenant-ops-backlog"'),
    "control does not value-import tenant-ops-backlog",
  );
  assert(control.includes("REVIEW"), "REVIEW preserved");
  assert(control.includes("RECOVER"), "RECOVER preserved");
  assert(control.includes("submitReviewAction"), "REVIEW submit prop preserved");
  assert(control.includes("showReview && reviewState?.result === \"SUCCESS\" && !isRecovered"), "RECOVER after REVIEW SUCCESS when not recovered");
  assert(control.includes("router.refresh()"), "refreshes after SUCCESS");
  assert(control.includes("executeLockedUntilRefresh"), "locks EXECUTE after SUCCESS until stage refresh");
  assert(control.includes("executeEligible && !executeLockedUntilRefresh"), "hides EXECUTE while locked");
  assert(control.includes("disabled={executePending || executeLockedUntilRefresh}"), "EXECUTE disabled while pending or locked");
  assert(control.includes("disabled={reviewPending}"), "REVIEW disabled while pending");
  assert(control.includes("disabled={recoveryPending}"), "RECOVER disabled while pending");
  assert(!control.includes("submitWorkspaceReview"), "no frozen submit");

  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("isTenantOpsExecuteEligible"), "panel mounts for execute stages");
  assert(panel.includes("reviewEligible={item.reviewEligible}"), "panel passes reviewEligible");
  assert(panel.includes("executeEligible={isTenantOpsExecuteEligible(item.stage)}"), "panel passes executeEligible");
  assert(panel.includes("stage={item.stage}"), "panel passes stage for execute lock");
  assert(panel.includes("item.reviewEligible"), "panel keeps reviewEligible path");
  console.log("✓ control + panel wiring");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
    "app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx",
  ];
  const forbidden = [
    "runTenantOpsExecuteAction",
    "tenant-ops-execute",
    "submitTenantOpsExecuteAction",
  ];
  for (const file of files) {
    const src = read(file);
    for (const token of forbidden) {
      assert(!src.includes(token), `${file} must not reference ${token}`);
    }
  }
  console.log("✓ frozen / CRM admin untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-EXECUTION-1 ===\n");
  checkExecuteModule();
  checkDerivation();
  checkSubmit();
  checkControlAndPanel();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
