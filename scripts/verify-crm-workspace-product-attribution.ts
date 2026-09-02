/**
 * Workspace CRM Surface Product Attribution v1 verification
 */
import fs from "node:fs";
import path from "node:path";

import { BudgetLevel, DeliveryMode, QuoteStatus, SiteType } from "@prisma/client";

import { assembleCrmWorkSurface } from "../lib/crm/crm.workspace-surface";
import { createLead } from "../lib/crm/lead/lead.service";
import { createCustomer } from "../lib/crm/customer/customer.service";
import { logProductActivity } from "../lib/crm/activity/activity.tracker";
import { prisma } from "../lib/prisma";

const ROOT = path.resolve(__dirname, "..");
const TEST_ORG_SLUG = "crm-workspace-product-attribution-v1";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkWorkspaceSurfaceAttribution() {
  const src = read("lib/crm/crm.workspace-surface.ts");
  assert(
    src.includes("resolveValidatedProductContextForCustomer"),
    "workspace surface uses validated resolver",
  );
  assert(
    src.includes("fillMissingProductContextIds"),
    "workspace surface fills missing IDs only",
  );
  assert(
    src.includes("validatedContextByCustomerId"),
    "workspace surface caches per customer",
  );
  assert(
    src.includes("enrichWorkItemsWithValidatedProductContext"),
    "workspace surface enrichment helper",
  );
  console.log("✓ workspace CRM surface attribution wiring");
}

function checkFrozenSurfacesUntouched() {
  const panel = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  assert(!panel.includes("commercial-context-bridge"), "workspace UI not wired to bridge");
  assert(!panel.includes("productHref"), "workspace UI has no deep-links");
  const commercialContext = read("app/(product)/commercial-context.ts");
  assert(
    !commercialContext.includes("resolveValidatedProductContextForCustomer"),
    "commercial-context.ts untouched",
  );
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  assert(!eads.includes("commercial-context-bridge"), "EADS untouched");
  assert(!eac.includes("commercial-context-bridge"), "EAC untouched");
  console.log("✓ frozen surfaces untouched");
}

async function seedProjectQuoteBudget(organizationId: string) {
  const project = await prisma.project.create({
    data: {
      name: `WS Attr Verify ${Date.now()}`,
      clientName: "WS Attr Co",
      siteType: SiteType.office,
      budgetLevel: BudgetLevel.mid,
      deliveryMode: DeliveryMode.standard,
      organizationId,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      projectId: project.id,
      workspaceId: `ws-attr-${Date.now()}`,
      organizationId,
      status: QuoteStatus.READY,
      companyInfo: { companyName: "WS Attr Co" },
    },
  });

  const budget = await prisma.budget.create({
    data: {
      projectId: project.id,
      totalEstimateMin: 100000,
      totalEstimateMax: 200000,
      items: [],
      assumptions: [],
    },
  });

  return { project, quote, budget };
}

async function checkRuntimeAttribution() {
  const org = await prisma.organization.upsert({
    where: { slug: TEST_ORG_SLUG },
    create: { name: "Workspace Product Attribution Verify", slug: TEST_ORG_SLUG },
    update: {},
  });

  const { project, quote, budget } = await seedProjectQuoteBudget(org.id);
  const customer = await createCustomer({
    organizationId: org.id,
    name: `WS Attr Customer ${Date.now()}`,
  });

  await createLead({
    customerId: customer.id,
    source: "quote_generation",
  });

  await logProductActivity({
    customerId: customer.id,
    product: "quote",
    resourceId: quote.id,
    organizationId: org.id,
    projectId: project.id,
    quoteId: quote.id,
  });

  await logProductActivity({
    customerId: customer.id,
    product: "budget",
    resourceId: budget.id,
    organizationId: org.id,
    projectId: project.id,
    quoteId: quote.id,
    budgetId: budget.id,
  });

  const surface = await assembleCrmWorkSurface(org.id);
  const leadItem = surface.items.find(
    (item) => item.customerId === customer.id && item.entity === "lead",
  );
  assert(leadItem !== undefined, "qualified product lead appears in work surface");
  assert(leadItem!.projectId === project.id, "lead item projectId attributed");
  assert(leadItem!.quoteId === quote.id, "lead item quoteId attributed");
  assert(leadItem!.budgetId === budget.id, "lead item budgetId attributed");

  console.log("✓ runtime workspace product context attribution");
}

async function main() {
  checkWorkspaceSurfaceAttribution();
  checkFrozenSurfacesUntouched();
  await checkRuntimeAttribution();
  console.log("\n✓ Workspace CRM Surface Product Attribution v1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
