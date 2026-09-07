/**
 * WP-RUNTIME-OPS-TENANT-HISTORY-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TENANT_OPS_ACTIVITY_TYPES,
  TENANT_OPS_HISTORY_ID,
  TENANT_OPS_HISTORY_VERSION,
} from "../lib/runtime-ops/tenant-ops-history";
import { TENANT_OPS_AUDIT_TYPES } from "../lib/runtime-ops/tenant-ops-audit";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkHistoryModule() {
  const src = read("lib/runtime-ops/tenant-ops-history.ts");
  assert(src.includes("export async function listTenantOpsHistory"), "list exported");
  assert(src.includes("getCustomerById"), "uses getCustomerById");
  assert(src.includes("getCustomerById(customerId, organizationId)"), "ownership call shape");
  assert(src.includes("TENANT_OPS_AUDIT_TYPES"), "filters audit types");
  assert(src.includes('type: { in: [...TENANT_OPS_ACTIVITY_TYPES] }'), "type filter");
  assert(src.includes("meta.organizationId"), "validates meta org when present");
  assert(src.includes("metaItem !== itemId"), "optional itemId filter");
  assert(src.includes("if (!customer) return []"), "rejects non-owned customer");
  assert(src.includes("No meta.org-only access"), "documents no meta-org-only access");
  assert(!src.includes("buildOrganizationTimeline"), "no org-timeline shortcut");
  assert(!/\bgetActionIntents\b/.test(src), "no EWI");
  assert(!/\bgetActionExecutionRequests\b/.test(src), "no EWEB");
  assert(!/\bexecuteControlledAction\b/.test(src), "no EWER");
  assert(src.includes(TENANT_OPS_HISTORY_ID), "id");
  assert(src.includes(TENANT_OPS_HISTORY_VERSION), "version");

  assert(
    TENANT_OPS_ACTIVITY_TYPES.includes(TENANT_OPS_AUDIT_TYPES.review),
    "includes review",
  );
  assert(
    TENANT_OPS_ACTIVITY_TYPES.includes(TENANT_OPS_AUDIT_TYPES.recover),
    "includes recover",
  );
  assert(
    TENANT_OPS_ACTIVITY_TYPES.includes(TENANT_OPS_AUDIT_TYPES.execute),
    "includes execute",
  );
  assert(
    TENANT_OPS_ACTIVITY_TYPES.includes(TENANT_OPS_AUDIT_TYPES.open_deal),
    "includes open_deal",
  );
  assert(
    TENANT_OPS_ACTIVITY_TYPES.includes(TENANT_OPS_AUDIT_TYPES.close_won),
    "includes close_won",
  );
  assert(TENANT_OPS_ACTIVITY_TYPES.length === 5, "five ops types");
  console.log("✓ tenant-ops-history module");
}

function checkNoUiApiSchema() {
  const src = read("lib/runtime-ops/tenant-ops-history.ts");
  assert(!src.includes("NextResponse"), "no API route");
  assert(!src.includes("WorkspaceActionSurfacePanel"), "no workspace UI");
  assert(!src.includes("prisma migrate"), "no migration");
  assert(!src.includes("schema.prisma"), "no schema");
  console.log("✓ no UI/API/schema in history module");
}

function checkFrozenUntouched() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/commercial/action-delivery/action-delivery.ts",
    "lib/crm/activity/activity.timeline.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("listTenantOpsHistory"), `${file} untouched`);
    assert(!src.includes("tenant-ops-history"), `${file} untouched`);
  }
  console.log("✓ frozen / CRM timeline untouched");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-HISTORY-1 ===\n");
  checkHistoryModule();
  checkNoUiApiSchema();
  checkFrozenUntouched();
  console.log("\nSTATUS: PASS");
}

main();
