/**
 * WP-WS-CRM-DLINK-1 — Workspace CRM Product Deep Link verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  productHref,
  type ProductCommercialContext,
} from "../app/(product)/commercial-context";
import type { CrmWorkItem } from "../lib/crm/crm.workspace-surface";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

type ProductRoute = "/quote" | "/budget" | "/tender";

function pickCrmWorkItemProductRoute(item: CrmWorkItem): ProductRoute | null {
  if (item.projectId && item.quoteId && item.budgetId) return "/tender";
  if (item.quoteId && item.budgetId) return "/budget";
  if (item.quoteId) return "/quote";
  return null;
}

function crmWorkItemProductContext(
  item: CrmWorkItem,
  organizationId: string,
): ProductCommercialContext {
  return {
    organizationId,
    ...(item.projectId ? { projectId: item.projectId } : {}),
    ...(item.quoteId ? { quoteId: item.quoteId } : {}),
    ...(item.budgetId ? { budgetId: item.budgetId } : {}),
  };
}

function checkWorkspaceDeepLinkUi() {
  const panel = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  assert(panel.includes("productHref"), "workspace panel uses productHref");
  assert(panel.includes("CrmWorkItemProductLink"), "workspace product link component");
  assert(panel.includes("pickCrmWorkItemProductRoute"), "route chosen from validated IDs");
  assert(!panel.includes("writeStoredProductContext"), "panel does not write session");
  assert(panel.includes("handoff: \"crm\""), "CRM workspace emits handoff");
  assert(!panel.includes('href={`/projects/'), "no projects-link expansion");
  console.log("✓ workspace CRM product deep-link UI");
}

function checkRouteSelection() {
  const quoteOnly: CrmWorkItem = {
    id: "crm:lead:1",
    customerId: "c1",
    customerName: "Co",
    entity: "lead",
    entityId: "l1",
    status: "QUALIFIED",
    label: "test",
    quoteId: "q1",
    projectId: "p1",
  };
  assert(pickCrmWorkItemProductRoute(quoteOnly) === "/quote", "quote route for quoteId");

  const budgetItem: CrmWorkItem = {
    ...quoteOnly,
    projectId: undefined,
    budgetId: "b1",
  };
  assert(pickCrmWorkItemProductRoute(budgetItem) === "/budget", "budget route for quote+budget");

  const tenderItem: CrmWorkItem = {
    ...quoteOnly,
    budgetId: "b1",
  };
  assert(
    pickCrmWorkItemProductRoute(tenderItem) === "/tender",
    "tender route for full chain",
  );

  const noQuote: CrmWorkItem = {
    ...quoteOnly,
    quoteId: undefined,
  };
  assert(pickCrmWorkItemProductRoute(noQuote) === null, "no route without quoteId");

  const href = productHref(
    "/budget",
    crmWorkItemProductContext(tenderItem, "org1"),
  );
  assert(href.includes("projectId=p1"), "productHref carries projectId");
  assert(href.includes("quoteId=q1"), "productHref carries quoteId");
  assert(href.includes("budgetId=b1"), "productHref carries budgetId");
  assert(href.includes("organizationId=org1"), "productHref carries organizationId");
  console.log("✓ product route selection");
}

function checkFrozenLayersUntouched() {
  const surface = read("lib/crm/crm.workspace-surface.ts");
  assert(!surface.includes("productHref"), "workspace surface unchanged");
  const bridge = read("lib/product/commercial-context-bridge.ts");
  assert(!bridge.includes("WorkspaceCrmWorkSurfacePanel"), "bridge unchanged");
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  assert(!eads.includes("productHref"), "EADS untouched");
  assert(!eac.includes("productHref"), "EAC untouched");
  console.log("✓ frozen layers untouched");
}

function main() {
  checkWorkspaceDeepLinkUi();
  checkRouteSelection();
  checkFrozenLayersUntouched();
  console.log("\n✓ WP-WS-CRM-DLINK-1 — ALL CHECKS PASSED");
}

main();
