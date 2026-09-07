/**
 * WP-POST-GA-TENANT-OPS-OPERABILITY-1 — static + pure aggregation verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  aggregateTenantOpsOperabilityRows,
  emptyTenantOpsOperabilityProjection,
  readTenantOpsOperability,
  TENANT_OPS_OPERABILITY_ID,
  TENANT_OPS_OPERABILITY_VERSION,
} from "../lib/runtime-ops/tenant-ops-operability";
import { TENANT_OPS_ACTIVITY_TYPES } from "../lib/runtime-ops/tenant-ops-history";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkModuleShape() {
  const src = read("lib/runtime-ops/tenant-ops-operability.ts");
  assert(src.includes("export async function readTenantOpsOperability"), "read exported");
  assert(src.includes("TENANT_OPS_ACTIVITY_TYPES"), "reuses activity types");
  assert(src.includes("where: { organizationId }"), "Customer.organizationId ownership");
  assert(src.includes("customerId: { in: customerIds }"), "scopes activities to org customers");
  assert(src.includes("timestamp:"), "timeWindow filter");
  assert(src.includes("gte: window.since"), "since bound");
  assert(src.includes("lte: window.until"), "until bound");
  assert(src.includes('type: { in: [...TENANT_OPS_ACTIVITY_TYPES] }'), "type filter");
  assert(src.includes("metaOrg && metaOrg !== orgId"), "meta org isolation");
  assert(src.includes("No meta.org-only access") || src.includes("Customer.organizationId only"), "ownership doc");
  assert(!src.includes("opportunity.update"), "no mutation");
  assert(!src.includes("deal.update"), "no deal mutation");
  assert(!src.includes("appendTenantOpsAudit"), "no audit write");
  assert(!src.includes("NextResponse"), "no API");
  assert(!src.includes("WorkspaceActionSurfacePanel"), "no UI");
  assert(!src.includes("prisma migrate"), "no migration");
  assert(typeof readTenantOpsOperability === "function", "runtime export");
  assert(src.includes(TENANT_OPS_OPERABILITY_ID), "id");
  assert(src.includes(TENANT_OPS_OPERABILITY_VERSION), "version");
  assert(TENANT_OPS_ACTIVITY_TYPES.length === 6, "six activity types available");
  console.log("✓ module shape / isolation / timeWindow");
}

function checkEmptyCase() {
  const since = new Date("2026-01-01T00:00:00.000Z");
  const until = new Date("2026-01-02T00:00:00.000Z");
  const empty = emptyTenantOpsOperabilityProjection({
    organizationId: "org-empty",
    since,
    until,
  });
  assert(empty.total === 0, "empty total");
  assert(empty.success === 0, "empty success");
  assert(empty.failed === 0, "empty failed");
  assert(empty.retryable === 0, "empty retryable");
  assert(empty.terminal === 0, "empty terminal");
  assert(Object.keys(empty.byAction).length === 0, "empty byAction");
  assert(Object.keys(empty.byFailureClass).length === 0, "empty byFailureClass");

  const fromRows = aggregateTenantOpsOperabilityRows([], "org-empty", {
    since,
    until,
  });
  assert(fromRows.total === 0, "aggregate empty total");
  console.log("✓ empty case");
}

function checkAggregation() {
  const since = new Date("2026-09-01T00:00:00.000Z");
  const until = new Date("2026-09-07T23:59:59.000Z");
  const orgId = "org-a";

  const projection = aggregateTenantOpsOperabilityRows(
    [
      {
        type: "tenant_ops.execute",
        meta: {
          organizationId: orgId,
          action: "execute",
          result: "SUCCESS",
        },
      },
      {
        type: "tenant_ops.review",
        meta: {
          organizationId: orgId,
          action: "review",
          result: "FAILED",
          reason: "role-forbidden",
          failureClass: "TERMINAL",
        },
      },
      {
        type: "tenant_ops.close_won",
        meta: {
          organizationId: orgId,
          action: "close-won",
          result: "FAILED",
          reason: "stage-changed",
        },
      },
      {
        type: "tenant_ops.open_deal",
        meta: {
          organizationId: "other-org",
          action: "open-deal",
          result: "FAILED",
          reason: "role-forbidden",
        },
      },
    ],
    orgId,
    { since, until },
  );

  assert(projection.total === 3, "skips foreign meta org");
  assert(projection.success === 1, "success count");
  assert(projection.failed === 2, "failed count");
  assert(projection.terminal === 1, "terminal from explicit class");
  assert(projection.retryable === 1, "retryable from stage-changed");
  assert(projection.byAction.execute === 1, "byAction execute");
  assert(projection.byAction.review === 1, "byAction review");
  assert(projection.byAction["close-won"] === 1, "byAction close-won");
  assert(projection.byFailureClass.TERMINAL === 1, "byFailureClass TERMINAL");
  assert(projection.byFailureClass.RETRYABLE === 1, "byFailureClass RETRYABLE");
  console.log("✓ aggregation + tenant meta isolation");
}

function checkFrozen() {
  const files = [
    "lib/commercial/action-execution/action-execution.ts",
    "lib/commercial/action-intent/action-intent.ts",
    "lib/workflow/experience/workspace-action-surface.ts",
    "lib/runtime-ops/tenant-ops-execute.ts",
    "lib/runtime-ops/tenant-ops-close-won.ts",
    "lib/runtime-ops/tenant-ops-close-lost.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("readTenantOpsOperability"), `${file} untouched`);
    assert(!src.includes("tenant-ops-operability"), `${file} untouched`);
  }
  console.log("✓ frozen / mutate paths untouched");
}

function checkLoadAction() {
  const src = read("app/(workspace)/load-tenant-ops-operability.ts");
  assert(src.includes('"use server"'), "server action");
  assert(src.includes("readTenantOpsOperability"), "uses read projection");
  assert(src.includes("resolveTenantOpsOrgContext"), "org/workspace gate");
  assert(src.includes("runWithTenantContext"), "tenant context");
  assert(src.includes("windowMs"), "optional timeWindow support");
  assert(!src.includes("time-window-missing"), "timeWindow optional with default");
  assert(!src.includes("appendTenantOpsAudit"), "no audit write");
  assert(!src.includes("isTenantOpsRoleAllowed"), "no mutate role gate");
  assert(!src.includes("opportunity.update"), "no mutation");
  assert(!src.includes("WorkspaceActionSurfacePanel"), "no UI wiring");
  console.log("✓ load-tenant-ops-operability");
}

function main() {
  console.log("=== WP-POST-GA-TENANT-OPS-OPERABILITY-1 ===\n");
  checkModuleShape();
  checkEmptyCase();
  checkAggregation();
  checkLoadAction();
  checkFrozen();
  console.log("\nSTATUS: PASS");
}

main();
