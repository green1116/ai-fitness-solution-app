/**
 * WP-RUNTIME-OPS-TENANT-BACKLOG-READ-MODEL-1 — static + unit verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  deriveTenantOpsAction,
  deriveTenantOpsReason,
  deriveTenantOpsState,
  deriveTenantReviewEligible,
  TENANT_OPS_BACKLOG_VERSION,
} from "../lib/runtime-ops/tenant-ops-backlog";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkReadModelModule() {
  const src = read("lib/runtime-ops/tenant-ops-backlog.ts");
  assert(src.includes("export async function readTenantOpsBacklog"), "readTenantOpsBacklog exported");
  assert(src.includes("organizationId: orgId"), "filters by organizationId");
  assert(src.includes("prisma.customer.findMany"), "reads Customer");
  assert(src.includes("prisma.opportunity.findMany"), "reads Opportunity");
  assert(src.includes("where: { organizationId: orgId }"), "Customer.organizationId ownership");
  assert(src.includes("customerId: { in: customerIds }"), "opportunities via customerId");
  assert(src.includes("deriveTenantOpsState"), "local state derivation");
  assert(src.includes("deriveTenantOpsAction"), "local action derivation");
  assert(src.includes("deriveTenantOpsReason"), "local reason derivation");
  assert(src.includes("deriveTenantReviewEligible"), "local reviewEligible");
  assert(!src.includes("listWorkspaceReviewSurfaceItemIds"), "reviewEligible not from EWI/EWEB ids");
  assert(!src.includes("readWorkspaceActionSurface"), "does not read EWAS");
  assert(!src.includes("fingerprint"), "no fingerprint copy");
  assert(!src.includes("ordinal"), "no ordinal copy");
  assert(!src.includes("workPackageId"), "no pack id copy");
  assert(!src.includes("deliveryId"), "no deliveryId copy");
  assert(src.includes("crm:opportunity:"), "tenant item id namespace");
  assert(src.includes(TENANT_OPS_BACKLOG_VERSION), "version constant");
  console.log("✓ tenant-ops-backlog read model");
}

function checkLocalDerivation() {
  assert(deriveTenantOpsState("NEGOTIATION") === "ATTENTION", "NEGOTIATION → ATTENTION");
  assert(deriveTenantOpsState("PROPOSAL") === "AVAILABLE", "PROPOSAL → AVAILABLE");
  assert(deriveTenantOpsState("INIT") === "AVAILABLE", "INIT → AVAILABLE");
  assert(deriveTenantOpsState("WON") === "DEFERRED", "WON → DEFERRED");
  assert(deriveTenantOpsState("LOST") === "DEFERRED", "LOST → DEFERRED");

  assert(deriveTenantOpsAction("NEGOTIATION") === "review-opportunity", "NEGOTIATION action");
  assert(deriveTenantOpsAction("PROPOSAL") === "advance-proposal", "PROPOSAL action");
  assert(deriveTenantOpsAction("INIT") === "prepare-proposal", "INIT action");

  assert(deriveTenantReviewEligible("NEGOTIATION") === true, "NEGOTIATION reviewEligible");
  assert(deriveTenantReviewEligible("PROPOSAL") === true, "PROPOSAL reviewEligible");
  assert(deriveTenantReviewEligible("INIT") === false, "INIT not reviewEligible");
  assert(deriveTenantReviewEligible("WON") === false, "WON not reviewEligible");

  const reason = deriveTenantOpsReason("NEGOTIATION", "Acme");
  assert(reason.includes("Acme"), "reason includes customer name");
  assert(reason.includes("NEGOTIATION"), "reason includes stage");
  console.log("✓ local state/action/reason/reviewEligible");
}

function checkPanelWiring() {
  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(panel.includes("readTenantOpsBacklog"), "panel prefers tenant backlog reader");
  assert(panel.includes("renderTenantOpsBacklogPanel"), "tenant panel path");
  assert(panel.includes("if (organizationId)"), "org gate");
  assert(panel.includes("renderFrozenEwasPanel"), "frozen EWAS fallback retained");
  assert(panel.includes("readWorkspaceActionSurface"), "EWAS path available for verify/fallback");
  assert(panel.includes("surface.items"), "EWAS item render retained");
  assert(panel.includes("No workspace actions"), "EWAS empty state retained");
  assert(panel.includes("listOpsCrmIdentityLinksByOpsCustomerIds"), "EWAS identity batch retained");
  assert(panel.includes("WorkspaceOpsCrmIdentityLinkControl"), "EWAS identity link retained");
  assert(panel.includes("listWorkspaceReviewSurfaceItemIds"), "EWAS review ids only on frozen path");
  assert(
    panel.includes("item.reviewEligible") || panel.includes("Review eligible"),
    "tenant reviewEligible shown locally",
  );
  assert(
    !/TenantBacklogItemRow[\s\S]*WorkspaceReviewActionControl/.test(panel),
    "tenant rows do not mount frozen review control",
  );
  assert(!panel.includes("fingerprint"), "panel does not copy fingerprints");
  assert(!panel.includes("workPackageId"), "panel does not copy pack ids");
  console.log("✓ WorkspaceActionSurfacePanel wiring");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const ewi = read("lib/commercial/action-intent/action-intent.ts");
  const eweb = read("lib/commercial/action-execution/action-execution.ts");
  const crmAdmin = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");

  assert(!eads.includes("tenant-ops-backlog"), "EADS untouched");
  assert(!eac.includes("tenant-ops-backlog"), "EAC untouched");
  assert(!ewas.includes("tenant-ops-backlog"), "EWAS untouched");
  assert(!ewi.includes("tenant-ops-backlog"), "EWI untouched");
  assert(!eweb.includes("tenant-ops-backlog"), "EWEB untouched");
  assert(!crmAdmin.includes("readTenantOpsBacklog"), "CRM admin surface untouched");
  assert(!crmAdmin.includes("tenant-ops-backlog"), "CRM admin does not import backlog");
  console.log("✓ frozen layers / CRM admin untouched");
}

function checkNoApiRoute() {
  const apiDir = path.join(ROOT, "app/api/runtime-ops");
  if (fs.existsSync(apiDir)) {
    const entries = fs.readdirSync(apiDir, { withFileTypes: true });
    for (const entry of entries) {
      assert(entry.name !== "backlog", "no runtime-ops/backlog API route");
    }
  }
  console.log("✓ no backlog API route");
}

function main() {
  console.log("=== WP-RUNTIME-OPS-TENANT-BACKLOG-READ-MODEL-1 ===\n");
  checkReadModelModule();
  checkLocalDerivation();
  checkPanelWiring();
  checkFrozenLayersUntouched();
  checkNoApiRoute();
  console.log("\nSTATUS: PASS");
}

main();
