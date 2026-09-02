/**
 * WP-WORKSPACE-OPS-PCX-LINK-1 — Workspace Ops Product Context deep link verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  productHref,
  type ProductCommercialContext,
} from "../app/(product)/commercial-context";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

type ProductRoute = "/quote" | "/budget" | "/tender";

function pickOpsProductRoute(ctx: ProductCommercialContext): ProductRoute | null {
  if (ctx.projectId && ctx.quoteId && ctx.budgetId) return "/tender";
  if (ctx.quoteId && ctx.budgetId) return "/budget";
  if (ctx.quoteId) return "/quote";
  return null;
}

function checkWorkspaceOpsDeepLinkUi() {
  const panel = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(
    panel.includes("resolveValidatedProductContextForOpsCustomer"),
    "ops action panel resolves validated PCX",
  );
  assert(panel.includes("productHref"), "ops action panel uses productHref");
  assert(panel.includes("OpsActionSurfaceProductLink"), "ops product link component");
  assert(panel.includes("pickOpsProductRoute"), "route chosen from validated PCX");
  assert(!panel.includes("writeStoredProductContext"), "panel does not write session");
  assert(panel.includes("handoff: \"crm\""), "ops workspace emits CRM handoff");
  assert(!panel.includes("runtime-ops/product-context"), "panel does not call ops PCX API");
  console.log("✓ workspace ops product deep-link UI");
}

function checkRouteSelection() {
  const quoteOnly: ProductCommercialContext = {
    organizationId: "org1",
    projectId: "p1",
    quoteId: "q1",
  };
  assert(pickOpsProductRoute(quoteOnly) === "/quote", "quote route for quoteId");

  const budgetCtx: ProductCommercialContext = {
    organizationId: "org1",
    quoteId: "q1",
    budgetId: "b1",
  };
  assert(pickOpsProductRoute(budgetCtx) === "/budget", "budget route for quote+budget");

  const tenderCtx: ProductCommercialContext = {
    organizationId: "org1",
    projectId: "p1",
    quoteId: "q1",
    budgetId: "b1",
  };
  assert(pickOpsProductRoute(tenderCtx) === "/tender", "tender route for full chain");

  const noQuote: ProductCommercialContext = {
    organizationId: "org1",
    projectId: "p1",
  };
  assert(pickOpsProductRoute(noQuote) === null, "no route without quoteId");

  const href = productHref("/budget", tenderCtx, { handoff: "crm" });
  assert(href.includes("projectId=p1"), "productHref carries projectId");
  assert(href.includes("quoteId=q1"), "productHref carries quoteId");
  assert(href.includes("budgetId=b1"), "productHref carries budgetId");
  assert(href.includes("organizationId=org1"), "productHref carries organizationId");
  assert(href.includes("handoff=crm"), "productHref carries CRM handoff");
  console.log("✓ ops product route selection");
}

function checkFrozenLayersUntouched() {
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const adapter = read("lib/product/runtime-ops-product-context-adapter.ts");
  const registry = read("lib/product/runtime-ops-crm-identity-registry.ts");
  const api = read("app/api/runtime-ops/product-context/route.ts");
  const commercialContext = read("app/(product)/commercial-context.ts");

  assert(!ewas.includes("resolveValidatedProductContextForOpsCustomer"), "EWAS untouched");
  assert(!eads.includes("resolveValidatedProductContextForOpsCustomer"), "EADS untouched");
  assert(!eac.includes("resolveValidatedProductContextForOpsCustomer"), "EAC untouched");
  assert(!adapter.includes("WorkspaceActionSurfacePanel"), "adapter unchanged");
  assert(!registry.includes("WorkspaceActionSurfacePanel"), "registry unchanged");
  assert(!api.includes("WorkspaceActionSurfacePanel"), "ops PCX API unchanged");
  assert(!commercialContext.includes("WorkspaceActionSurfacePanel"), "commercial-context unchanged");
  console.log("✓ frozen layers and read boundary untouched");
}

function main() {
  checkWorkspaceOpsDeepLinkUi();
  checkRouteSelection();
  checkFrozenLayersUntouched();
  console.log("\n✓ WP-WORKSPACE-OPS-PCX-LINK-1 — ALL CHECKS PASSED");
}

main();
