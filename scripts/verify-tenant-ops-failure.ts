/**
 * WP-RUNTIME-OPS-TENANT-FAILURE-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  classifyTenantOpsFailure,
  failureClassForOutcome,
  TENANT_OPS_FAILURE_ID,
  TENANT_OPS_FAILURE_VERSION,
} from "../lib/runtime-ops/tenant-ops-failure";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkClassifier() {
  assert(classifyTenantOpsFailure("stage-changed") === "RETRYABLE", "stage-changed retryable");
  assert(classifyTenantOpsFailure("auth-required") === "RETRYABLE", "auth-required retryable");
  assert(classifyTenantOpsFailure("role-forbidden") === "TERMINAL", "role-forbidden terminal");
  assert(classifyTenantOpsFailure("organization-mismatch") === "TERMINAL", "org mismatch terminal");
  assert(classifyTenantOpsFailure("not-executable") === "TERMINAL", "not-executable terminal");
  assert(classifyTenantOpsFailure("not-review-eligible") === "TERMINAL", "not-review-eligible terminal");
  assert(classifyTenantOpsFailure("pipeline boom") === "RETRYABLE", "unknown → retryable");
  assert(failureClassForOutcome("SUCCESS", "idempotent") === undefined, "SUCCESS has no class");
  assert(failureClassForOutcome("FAILED", "role-forbidden") === "TERMINAL", "FAILED class");
  assert(failureClassForOutcome("BLOCKED", "stage-changed") === "RETRYABLE", "BLOCKED class");
  assert(TENANT_OPS_FAILURE_ID === "tenant-ops-failure-1", "id");
  assert(TENANT_OPS_FAILURE_VERSION.includes("failure"), "version");
  console.log("✓ classifier");
}

function checkWired() {
  for (const file of [
    "lib/runtime-ops/tenant-ops-action.ts",
    "lib/runtime-ops/tenant-ops-recovery.ts",
    "lib/runtime-ops/tenant-ops-execute.ts",
  ]) {
    const src = read(file);
    assert(src.includes("failureClassForOutcome"), `${file} sets failureClass`);
    assert(src.includes("failureClass: result.failureClass"), `${file} audits failureClass`);
    assert(!src.includes("setTimeout"), `${file} no auto-retry`);
    assert(!src.includes("retry("), `${file} no retry helper`);
  }
  const audit = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(audit.includes("failureClass?"), "audit meta optional failureClass");
  console.log("✓ action/recovery/execute + audit wired");
}

function checkSubmitGateUntouched() {
  for (const file of [
    "app/(workspace)/submit-tenant-ops-review-action.ts",
    "app/(workspace)/submit-tenant-ops-recovery-action.ts",
    "app/(workspace)/submit-tenant-ops-execute-action.ts",
  ]) {
    const src = read(file);
    assert(!src.includes("tenant-ops-failure"), `${file} no failure classifier`);
    assert(!src.includes("appendTenantOpsAudit"), `${file} no submit-gate audit`);
  }
  console.log("✓ submit gates unchanged (no audit)");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
  ];
  for (const file of files) {
    assert(!read(file).includes("tenant-ops-failure"), `${file} untouched`);
  }
  console.log("✓ frozen untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-FAILURE-1 ===\n");
  checkClassifier();
  checkWired();
  checkSubmitGateUntouched();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
