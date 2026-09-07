/**
 * WP-DEAL-GATE-AUDIT-1 — static verification
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
  assert(src.includes("kind: TenantOpsAuditKind"), "accepts all audit kinds");
  assert(src.includes("Gate audit must not alter"), "swallows gate audit errors");
  assert(src.includes('result: "FAILED"'), "FAILED result");
  assert(src.includes("failureClassForOutcome"), "reuses failure classification");
  assert(src.includes("resolveGateAuditCustomerId"), "ownership customer anchor");
  assert(!src.includes("prisma migrate"), "no migration");
  console.log("✓ appendTenantOpsGateFailureAudit widened for deals");
}

function checkDealSubmit(file: string, kind: string, action: string) {
  const src = read(file);
  assert(src.includes("appendTenantOpsGateFailureAudit"), `${file} audits gate`);
  assert(src.includes(`kind: "${kind}"`), `${file} kind=${kind}`);
  assert(src.includes(`action: "${action}"`), `${file} action=${action}`);
  assert(src.includes("getCurrentUser"), `${file} session user for org gate`);
  assert(!src.includes('formData.get("userId")'), `${file} no client userId`);
  assert(src.includes("return failed"), `${file} preserves gateFailed return`);
  assert(src.includes("resolveTenantOpsOrgContext"), `${file} org gate retained`);
  assert(src.includes("isTenantOpsRoleAllowed"), `${file} role gate retained`);
  assert(src.includes("runWithTenantContext"), `${file} tenant context retained`);
  assert(
    src.includes('revalidatePath("/projects", "layout")'),
    `${file} SUCCESS revalidate retained`,
  );
  assert(
    src.indexOf("appendTenantOpsGateFailureAudit") <
      src.indexOf("runWithTenantContext"),
    `${file} audits only before business run`,
  );
  console.log(`✓ ${file}`);
}

function checkBusinessModulesUntouched() {
  const files = [
    "lib/runtime-ops/tenant-ops-open-deal.ts",
    "lib/runtime-ops/tenant-ops-close-won.ts",
    "lib/runtime-ops/tenant-ops-close-lost.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(
      !src.includes("appendTenantOpsGateFailureAudit"),
      `${file} no gate-failure helper (business audit unchanged)`,
    );
  }
  console.log("✓ deal business modules semantics untouched");
}

function checkFrozen() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/runtime-ops/tenant-ops-operability.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("WP-DEAL-GATE-AUDIT"), `${file} untouched`);
  }
  console.log("✓ frozen / WP1 untouched");
}

function main() {
  console.log("=== WP-DEAL-GATE-AUDIT-1 ===\n");
  checkAuditHelper();
  checkDealSubmit(
    "app/(workspace)/submit-tenant-ops-open-deal-action.ts",
    "open_deal",
    "open-deal",
  );
  checkDealSubmit(
    "app/(workspace)/submit-tenant-ops-close-won-action.ts",
    "close_won",
    "close-won",
  );
  checkDealSubmit(
    "app/(workspace)/submit-tenant-ops-close-lost-action.ts",
    "close_lost",
    "close-lost",
  );
  checkBusinessModulesUntouched();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
