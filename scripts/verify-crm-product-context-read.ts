/**
 * WP-CRM-PCX-READ-1 — CRM Product Context Read API verification
 */
import fs from "node:fs";
import path from "node:path";

import { BudgetLevel, DeliveryMode, QuoteStatus, SiteType } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createCustomer } from "../lib/crm/customer/customer.service";
import { logProductActivity } from "../lib/crm/activity/activity.tracker";
import {
  resolveProductContextForCustomer,
  resolveValidatedProductContextForCustomer,
  validateResolvedProductContextForOrganization,
} from "../lib/product/commercial-context-bridge";

const ROOT = path.resolve(__dirname, "..");
const TEST_ORG_SLUG = "crm-product-context-read-v1-verify";
const OTHER_ORG_SLUG = "crm-product-context-read-v1-other";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkApiRoute() {
  const src = read("app/api/crm/product-context/route.ts");
  assert(src.includes("runSaasOrgGate"), "product-context route gated");
  assert(src.includes("getCustomerById"), "product-context validates customer tenancy");
  assert(
    src.includes("resolveValidatedProductContextForCustomer"),
    "product-context uses validated resolver",
  );
  assert(src.includes('searchParams.get("customerId")'), "product-context requires customerId");
  assert(src.includes("Product context not found"), "missing context returns 404");
  console.log("✓ CRM product-context API route");
}

function checkBridgeValidation() {
  const src = read("lib/product/commercial-context-bridge.ts");
  assert(
    src.includes("export async function validateResolvedProductContextForOrganization"),
    "validateResolvedProductContextForOrganization exported",
  );
  assert(
    src.includes("export async function resolveValidatedProductContextForCustomer"),
    "resolveValidatedProductContextForCustomer exported",
  );
  assert(src.includes("assertResourceBelongsToTenant"), "validation enforces tenant ownership");
  assert(src.includes("loadCustomerProductAttribution"), "validation checks customer attribution");
  console.log("✓ validated commercial context bridge");
}

function checkFrozenSurfacesUntouched() {
  const commercialContext = read("app/(product)/commercial-context.ts");
  assert(
    !commercialContext.includes("validateResolvedProductContextForOrganization"),
    "commercial-context.ts untouched",
  );
  const workspace = read("lib/crm/crm.workspace-surface.ts");
  assert(
    !workspace.includes("commercial-context-bridge"),
    "workspace surface not enriched",
  );
  const panel = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  assert(!panel.includes("product-context"), "workspace UI untouched");
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  assert(!eads.includes("commercial-context-bridge"), "EADS untouched");
  assert(!eac.includes("commercial-context-bridge"), "EAC untouched");
  console.log("✓ frozen surfaces untouched");
}

async function upsertOrg(slug: string, name: string) {
  return prisma.organization.upsert({
    where: { slug },
    create: { name, slug },
    update: {},
  });
}

async function seedProjectQuoteBudget(organizationId: string) {
  const project = await prisma.project.create({
    data: {
      name: `PCX Read Verify ${Date.now()}`,
      clientName: "PCX Verify Co",
      siteType: SiteType.office,
      budgetLevel: BudgetLevel.mid,
      deliveryMode: DeliveryMode.standard,
      organizationId,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      projectId: project.id,
      workspaceId: `ws-pcx-${Date.now()}`,
      organizationId,
      status: QuoteStatus.READY,
      companyInfo: { companyName: "PCX Verify Co" },
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

async function checkRuntimeValidation() {
  const org = await upsertOrg(TEST_ORG_SLUG, "CRM Product Context Read Verify");
  const otherOrg = await upsertOrg(OTHER_ORG_SLUG, "CRM Product Context Read Other");
  const { project, quote, budget } = await seedProjectQuoteBudget(org.id);

  const customer = await createCustomer({
    organizationId: org.id,
    name: `PCX Read Customer ${Date.now()}`,
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

  const raw = await resolveProductContextForCustomer(org.id, customer.id);
  assert(raw !== null, "raw resolver returns context");

  const validated = await resolveValidatedProductContextForCustomer(org.id, customer.id);
  assert(validated !== null, "validated resolver returns context");
  assert(validated!.organizationId === org.id, "validated organizationId");
  assert(validated!.projectId === project.id, "validated projectId");
  assert(validated!.quoteId === quote.id, "validated quoteId");
  assert(validated!.budgetId === budget.id, "validated budgetId");

  const crossOrg = await resolveValidatedProductContextForCustomer(otherOrg.id, customer.id);
  assert(crossOrg === null, "cross-org customer returns null");

  const otherProject = await prisma.project.create({
    data: {
      name: "Foreign Project",
      siteType: SiteType.office,
      budgetLevel: BudgetLevel.mid,
      deliveryMode: DeliveryMode.standard,
      organizationId: otherOrg.id,
    },
  });

  const mixed = await validateResolvedProductContextForOrganization(org.id, customer.id, {
    organizationId: org.id,
    projectId: otherProject.id,
    quoteId: quote.id,
    budgetId: budget.id,
  });
  assert(mixed === null, "cross-project mixed context rejected");

  const foreignQuote = await prisma.quote.create({
    data: {
      projectId: otherProject.id,
      workspaceId: `ws-foreign-${Date.now()}`,
      organizationId: otherOrg.id,
      status: QuoteStatus.READY,
    },
  });

  const foreignCtx = await validateResolvedProductContextForOrganization(org.id, customer.id, {
    organizationId: org.id,
    quoteId: foreignQuote.id,
  });
  assert(foreignCtx === null, "foreign quote rejected for customer/org");

  const emptyCustomer = await createCustomer({
    organizationId: org.id,
    name: `PCX Empty ${Date.now()}`,
  });
  const emptyValidated = await resolveValidatedProductContextForCustomer(
    org.id,
    emptyCustomer.id,
  );
  assert(emptyValidated === null, "customer without product context returns null");

  console.log("✓ runtime validated product context read");
}

async function main() {
  checkApiRoute();
  checkBridgeValidation();
  checkFrozenSurfacesUntouched();
  await checkRuntimeValidation();
  console.log("\n✓ WP-CRM-PCX-READ-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
