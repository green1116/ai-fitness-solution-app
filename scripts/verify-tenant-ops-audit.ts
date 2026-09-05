/**
 * WP-RUNTIME-OPS-TENANT-AUDIT-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TENANT_OPS_AUDIT_ID,
  TENANT_OPS_AUDIT_TYPES,
  TENANT_OPS_AUDIT_VERSION,
  toTenantOpsAuditResult,
} from "../lib/runtime-ops/tenant-ops-audit";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkAuditModule() {
  const src = read("lib/runtime-ops/tenant-ops-audit.ts");
  assert(src.includes("export async function appendTenantOpsAudit"), "append exported");
  assert(src.includes("logCRMActivity"), "uses logCRMActivity");
  assert(src.includes('tenant_ops.review'), "review type");
  assert(src.includes('tenant_ops.recover'), "recover type");
  assert(src.includes('tenant_ops.execute'), "execute type");
  assert(src.includes("organizationId"), "meta organizationId");
  assert(src.includes("userId"), "meta userId");
  assert(src.includes("itemId"), "meta itemId");
  assert(src.includes("customerId"), "meta customerId");
  assert(src.includes("action"), "meta action");
  assert(src.includes("result"), "meta result");
  assert(src.includes("reason"), "meta reason");
  assert(src.includes("timestamp"), "meta timestamp");
  assert(src.includes("Audit must not fail business action"), "swallows errors");
  assert(!src.includes("prisma migrate"), "no migration");
  assert(src.includes(TENANT_OPS_AUDIT_ID), "audit id");
  assert(src.includes(TENANT_OPS_AUDIT_VERSION), "audit version");
  assert(TENANT_OPS_AUDIT_TYPES.review === "tenant_ops.review", "review const");
  assert(TENANT_OPS_AUDIT_TYPES.recover === "tenant_ops.recover", "recover const");
  assert(TENANT_OPS_AUDIT_TYPES.execute === "tenant_ops.execute", "execute const");
  assert(toTenantOpsAuditResult("SUCCESS") === "SUCCESS", "SUCCESS maps");
  assert(toTenantOpsAuditResult("FAILED") === "FAILED", "FAILED maps");
  assert(toTenantOpsAuditResult("BLOCKED") === "FAILED", "BLOCKED → FAILED");
  console.log("✓ tenant-ops-audit module");
}

function checkWiredAtBoundaries() {
  const files = [
    ["lib/runtime-ops/tenant-ops-action.ts", "review"],
    ["lib/runtime-ops/tenant-ops-recovery.ts", "recover"],
    ["lib/runtime-ops/tenant-ops-execute.ts", "execute"],
  ] as const;

  for (const [file, kind] of files) {
    const src = read(file);
    assert(src.includes("appendTenantOpsAudit"), `${file} appends audit`);
    assert(src.includes("toTenantOpsAuditResult"), `${file} maps result`);
    assert(src.includes(`kind: "${kind}"`), `${file} kind=${kind}`);
    assert(!/\bgetActionIntents\b/.test(src), `${file} no EWI`);
    assert(!/\bgetActionExecutionRequests\b/.test(src), `${file} no EWEB`);
    assert(!/\bexecuteControlledAction\b/.test(src), `${file} no EWER`);
  }
  console.log("✓ review / recover / execute boundaries wired");
}

function checkSubmitUserIdFromSession() {
  const review = read("app/(workspace)/submit-tenant-ops-review-action.ts");
  assert(review.includes("userId: gate.tenant.userId"), "review passes session userId");
  assert(!review.includes('formData.get("userId")'), "review never trusts client userId");

  const recovery = read("app/(workspace)/submit-tenant-ops-recovery-action.ts");
  assert(recovery.includes("userId: gate.tenant.userId"), "recovery passes session userId");
  assert(!recovery.includes('formData.get("userId")'), "recovery never trusts client userId");

  const execute = read("app/(workspace)/submit-tenant-ops-execute-action.ts");
  assert(execute.includes("userId: gate.tenant.userId"), "execute still passes session userId");
  console.log("✓ submit userId from server session");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("tenant-ops-audit"), `${file} untouched`);
    assert(!src.includes("appendTenantOpsAudit"), `${file} no audit call`);
  }
  console.log("✓ frozen paths untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-AUDIT-1 ===\n");
  checkAuditModule();
  checkWiredAtBoundaries();
  checkSubmitUserIdFromSession();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
