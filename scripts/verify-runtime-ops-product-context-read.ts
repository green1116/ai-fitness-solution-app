/**
 * WP-RUNTIME-OPS-PCX-READ-1 — Runtime Ops Product Context Read API verification
 */
import fs from "node:fs";
import path from "node:path";

import { BudgetLevel, DeliveryMode, QuoteStatus, SiteType } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { logProductActivity } from "../lib/crm/activity/activity.tracker";
import {
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
} from "../lib/product/runtime-ops-crm-identity-registry";
import { resolveValidatedProductContextForOpsCustomer } from "../lib/product/runtime-ops-product-context-adapter";

const ROOT = path.resolve(__dirname, "..");
const VERIFY_ORG_SLUG = "runtime-ops-crm-identity-v1-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkApiRoute() {
  const src = read("app/api/runtime-ops/product-context/route.ts");
  assert(src.includes("runSaasOrgGate"), "runtime-ops product-context route gated");
  assert(
    src.includes("resolveValidatedProductContextForOpsCustomer"),
    "runtime-ops product-context uses ops adapter",
  );
  assert(
    src.includes('searchParams.get("opsCustomerId")'),
    "runtime-ops product-context requires opsCustomerId",
  );
  assert(src.includes("gate.organizationId"), "runtime-ops product-context uses gate org");
  assert(src.includes("Product context not found"), "missing context returns 404");
  assert(!src.includes("findOrCreateCustomer"), "route not name-based");
  assert(!src.includes("writeStoredProductContext"), "route does not write session");
  console.log("✓ runtime-ops product-context API route");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const workspace = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  const crmPanel = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  const commercialContext = read("app/(product)/commercial-context.ts");
  const registry = read("lib/product/runtime-ops-crm-identity-registry.ts");

  assert(!eads.includes("runtime-ops/product-context"), "EADS untouched");
  assert(!eac.includes("runtime-ops/product-context"), "EAC untouched");
  assert(!ewas.includes("runtime-ops/product-context"), "EWAS untouched");
  assert(!workspace.includes("runtime-ops/product-context"), "workspace action UI untouched");
  assert(!crmPanel.includes("runtime-ops/product-context"), "workspace CRM UI untouched");
  assert(!commercialContext.includes("runtime-ops/product-context"), "journey context untouched");
  assert(!registry.includes("EXPLICIT_IDENTITY_SEEDS.push"), "registry not expanded");
  console.log("✓ frozen layers and registry untouched");
}

async function upsertVerifyOrgAndCustomer() {
  const org = await prisma.organization.upsert({
    where: { slug: VERIFY_ORG_SLUG },
    create: {
      id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
      slug: VERIFY_ORG_SLUG,
      name: "Runtime Ops CRM Identity Verify",
    },
    update: {},
  });

  await prisma.customer.upsert({
    where: { id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID },
    create: {
      id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
      organizationId: org.id,
      name: "Ops CRM Identity Verify Customer",
      industry: "",
      status: "ACTIVE",
    },
    update: {
      organizationId: org.id,
      name: "Ops CRM Identity Verify Customer",
      status: "ACTIVE",
    },
  });

  return org;
}

async function seedProjectQuoteBudget(organizationId: string) {
  const project = await prisma.project.create({
    data: {
      name: `Ops PCX Read Verify ${Date.now()}`,
      clientName: "Ops PCX Verify Co",
      siteType: SiteType.office,
      budgetLevel: BudgetLevel.mid,
      deliveryMode: DeliveryMode.standard,
      organizationId,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      projectId: project.id,
      workspaceId: `ws-ops-pcx-${Date.now()}`,
      organizationId,
      status: QuoteStatus.READY,
      companyInfo: { companyName: "Ops PCX Verify Co" },
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

async function checkUnmappedReturnsNull() {
  const unmapped = await resolveValidatedProductContextForOpsCustomer(
    "org-unmapped",
    "cust-pg21-alpha",
  );
  assert(unmapped === null, "unmapped ops customer returns null");

  const wrongOps = await resolveValidatedProductContextForOpsCustomer(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    "cust-pg21-alpha",
  );
  assert(wrongOps === null, "unmapped ops id for verify org returns null");

  console.log("✓ unmapped ops customer resolves to null (API 404)");
}

async function checkMappedWithoutProductContextReturnsNull() {
  await upsertVerifyOrgAndCustomer();

  await prisma.cRMActivity.deleteMany({
    where: { customerId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID },
  });

  const withoutPcx = await resolveValidatedProductContextForOpsCustomer(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(withoutPcx === null, "mapped ops customer without product activity returns null");

  console.log("✓ mapped identity without PCX returns null (API 404)");
}

async function checkMappedWithProductContext() {
  const org = await upsertVerifyOrgAndCustomer();
  const { project, quote, budget } = await seedProjectQuoteBudget(org.id);

  await logProductActivity({
    customerId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    product: "quote",
    resourceId: quote.id,
    organizationId: org.id,
    projectId: project.id,
    quoteId: quote.id,
  });

  await logProductActivity({
    customerId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    product: "budget",
    resourceId: budget.id,
    organizationId: org.id,
    projectId: project.id,
    quoteId: quote.id,
    budgetId: budget.id,
  });

  const validated = await resolveValidatedProductContextForOpsCustomer(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(validated !== null, "mapped ops customer with product activity returns context");
  assert(validated!.organizationId === org.id, "validated organizationId");
  assert(validated!.projectId === project.id, "validated projectId");
  assert(validated!.quoteId === quote.id, "validated quoteId");
  assert(validated!.budgetId === budget.id, "validated budgetId");

  const crossOrg = await resolveValidatedProductContextForOpsCustomer(
    "org-other-runtime-ops-pcx",
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(crossOrg === null, "cross-org ops lookup returns null");

  console.log("✓ mapped ops customer returns validated product context");
}

async function main() {
  checkApiRoute();
  checkFrozenLayersUntouched();
  await checkUnmappedReturnsNull();
  await checkMappedWithoutProductContextReturnsNull();
  await checkMappedWithProductContext();
  console.log("\n✓ WP-RUNTIME-OPS-PCX-READ-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
