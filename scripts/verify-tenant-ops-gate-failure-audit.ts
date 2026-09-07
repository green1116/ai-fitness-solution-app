/**
 * WP-RUNTIME-OPS-TENANT-GATE-FAILURE-AUDIT-1 — static verification
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

function checkAuditHelper() {
  const src = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(
    src.includes("export async function appendTenantOpsGateFailureAudit"),
    "gate failure audit exported",
  );
  assert(src.includes("Gate audit must not alter"), "swallows gate audit errors");
  assert(src.includes('result: "FAILED"'), "FAILED result");
  assert(src.includes("userId"), "requires userId path");
  assert(!src.includes("prisma migrate"), "no migration");
  console.log("✓ appendTenantOpsGateFailureAudit");
}

function checkSubmit(file: string, kind: string, action: string) {
  const src = read(file);
  assert(src.includes("appendTenantOpsGateFailureAudit"), `${file} audits gate`);
  assert(src.includes(`kind: "${kind}"`), `${file} kind=${kind}`);
  assert(src.includes(`action: "${action}"`), `${file} action=${action}`);
  assert(src.includes("getCurrentUser"), `${file} session user for org gate`);
  assert(!src.includes('formData.get("userId")'), `${file} no client userId`);
  assert(src.includes("return failed"), `${file} preserves gateFailed return`);
  console.log(`✓ ${file}`);
}

function checkFrozen() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("appendTenantOpsGateFailureAudit"), `${file} untouched`);
  }
  console.log("✓ frozen untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-GATE-FAILURE-AUDIT-1 ===\n");
  checkAuditHelper();
  checkSubmit(
    "app/(workspace)/submit-tenant-ops-review-action.ts",
    "review",
    "review",
  );
  checkSubmit(
    "app/(workspace)/submit-tenant-ops-recovery-action.ts",
    "recover",
    "recover",
  );
  checkSubmit(
    "app/(workspace)/submit-tenant-ops-execute-action.ts",
    "execute",
    "execute",
  );
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
