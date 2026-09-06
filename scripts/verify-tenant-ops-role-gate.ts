/**
 * WP-RUNTIME-OPS-TENANT-ROLE-GATE-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  isTenantOpsRoleAllowed,
  TENANT_OPS_MUTATE_PERMISSION,
  TENANT_OPS_ROLE_FORBIDDEN_REASON,
  TENANT_OPS_ROLE_GATE_ID,
  TENANT_OPS_ROLE_GATE_VERSION,
} from "../lib/runtime-ops/tenant-ops-role-gate";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkHelper() {
  const src = read("lib/runtime-ops/tenant-ops-role-gate.ts");
  assert(src.includes("roleHasPermission"), "reuses roleHasPermission");
  assert(src.includes(TENANT_OPS_MUTATE_PERMISSION), "manage_members permission");
  assert(src.includes("isTenantOpsRoleAllowed"), "allow helper");
  assert(src.includes(TENANT_OPS_ROLE_FORBIDDEN_REASON), "role-forbidden reason");
  assert(!src.includes("formData"), "no client role");
  assert(src.includes(TENANT_OPS_ROLE_GATE_ID), "id");
  assert(src.includes(TENANT_OPS_ROLE_GATE_VERSION), "version");

  assert(isTenantOpsRoleAllowed("OWNER"), "OWNER allowed");
  assert(isTenantOpsRoleAllowed("ADMIN"), "ADMIN allowed");
  assert(!isTenantOpsRoleAllowed("MEMBER"), "MEMBER rejected");
  console.log("✓ tenant-ops-role-gate helper");
}

function checkOrgGateExposesRole() {
  const src = read("lib/runtime-ops/tenant-ops-org-gate.ts");
  assert(src.includes("role: membership.role"), "returns membership.role");
  assert(src.includes("getMembership"), "membership validation retained");
  assert(src.includes("organization-forbidden"), "membership forbid retained");
  assert(!src.includes("isTenantOpsRoleAllowed"), "role check not folded into org gate");
  assert(!src.includes("role-forbidden"), "org gate reasons unchanged");
  console.log("✓ org gate exposes role without changing membership rules");
}

function checkSubmits() {
  const files = [
    "app/(workspace)/submit-tenant-ops-review-action.ts",
    "app/(workspace)/submit-tenant-ops-execute-action.ts",
    "app/(workspace)/submit-tenant-ops-recovery-action.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(src.includes("isTenantOpsRoleAllowed"), `${file} role gate`);
    assert(src.includes("TENANT_OPS_ROLE_FORBIDDEN_REASON"), `${file} role-forbidden`);
    assert(src.includes("gate.role"), `${file} uses server role`);
    assert(!src.includes('formData.get("role")'), `${file} never trusts client role`);
    assert(src.includes("resolveTenantOpsOrgContext"), `${file} org gate first`);
  }
  console.log("✓ REVIEW/RECOVER/EXECUTE submits gated");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
    "lib/organization/role.service.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("tenant-ops-role-gate"), `${file} untouched`);
    assert(!src.includes("isTenantOpsRoleAllowed"), `${file} no role-gate call`);
  }
  console.log("✓ frozen / role.service untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-ROLE-GATE-1 ===\n");
  checkHelper();
  checkOrgGateExposesRole();
  checkSubmits();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
