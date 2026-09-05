/**
 * WP-RUNTIME-OPS-TENANT-ORG-CONTEXT-ALIGN-1 — static verification
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

function checkGate() {
  const src = read("lib/runtime-ops/tenant-ops-org-gate.ts");
  assert(src.includes("export async function resolveTenantOpsOrgContext"), "gate exported");
  assert(src.includes("getMembership"), "membership check");
  assert(src.includes("organization-missing"), "missing org reason");
  assert(src.includes("organization-forbidden"), "forbidden org reason");
  assert(src.includes("auth-required"), "auth reason");
  assert(!src.includes("listOrganizationsForUser"), "does not pick orgs[0]");
  assert(!src.includes("ensureOrganizationForUser"), "does not auto-create org");
  console.log("✓ tenant-ops-org-gate");
}

function checkControl() {
  const src = read("app/(workspace)/TenantOpsReviewActionControl.tsx");
  assert(src.includes("useWorkspaceOrganizationId"), "reads UI org context");
  assert(src.includes('name="organizationId"'), "passes organizationId");
  assert(src.includes("REVIEW"), "REVIEW retained");
  assert(src.includes("RECOVER"), "RECOVER retained");
  assert(src.includes("EXECUTE"), "EXECUTE retained");
  assert(src.includes("router.refresh()"), "refresh retained");
  console.log("✓ TenantOpsReviewActionControl org pass-through");
}

function checkSubmits() {
  const files = [
    "app/(workspace)/submit-tenant-ops-review-action.ts",
    "app/(workspace)/submit-tenant-ops-execute-action.ts",
    "app/(workspace)/submit-tenant-ops-recovery-action.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(src.includes("resolveTenantOpsOrgContext"), `${file} uses org gate`);
    assert(src.includes('formData.get("organizationId")'), `${file} reads organizationId`);
    assert(src.includes("runWithTenantContext"), `${file} uses tenant context`);
    assert(!src.includes("listOrganizationsForUser"), `${file} does not use orgs[0]`);
    assert(!src.includes("ensureOrganizationForUser"), `${file} does not ensure org`);
  }
  const execute = read("app/(workspace)/submit-tenant-ops-execute-action.ts");
  assert(execute.includes('revalidatePath("/projects", "layout")'), "execute revalidate retained");
  const recovery = read("app/(workspace)/submit-tenant-ops-recovery-action.ts");
  assert(recovery.includes('revalidatePath("/projects", "layout")'), "recovery revalidate retained");
  console.log("✓ tenant submit org gate");
}

function checkLayoutUntouched() {
  const layout = read("app/(workspace)/layout.tsx");
  assert(layout.includes("listOrganizationsForUser"), "layout org resolution unchanged");
  assert(layout.includes("WorkspaceOrganizationProvider"), "provider retained");
  assert(!layout.includes("resolveTenantOpsOrgContext"), "layout not coupled to gate");
  console.log("✓ layout org resolution unchanged");
}

function checkFrozenUntouched() {
  const files = [
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-execution/controlled-action.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/commercial/action-consumption/action-consumption.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("resolveTenantOpsOrgContext"), `${file} untouched`);
    assert(!src.includes("tenant-ops-org-gate"), `${file} untouched`);
  }
  console.log("✓ frozen layers untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-ORG-CONTEXT-ALIGN-1 ===\n");
  checkGate();
  checkControl();
  checkSubmits();
  checkLayoutUntouched();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
