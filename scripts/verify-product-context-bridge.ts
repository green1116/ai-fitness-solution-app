/**
 * Commercial Context Bridge v1 verification
 */
import fs from "node:fs";
import path from "node:path";

import { prisma } from "../lib/prisma";
import { createCustomer } from "../lib/crm/customer/customer.service";
import { logProductActivity } from "../lib/crm/activity/activity.tracker";
import { resolveProductContextForCustomer } from "../lib/product/commercial-context-bridge";

const ROOT = path.resolve(__dirname, "..");
const TEST_ORG_SLUG = "product-context-bridge-v1-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkActivityTrackerMeta() {
  const src = read("lib/crm/activity/activity.tracker.ts");
  assert(src.includes("projectId?: string"), "logProductActivity accepts projectId");
  assert(src.includes("quoteId?: string"), "logProductActivity accepts quoteId");
  assert(src.includes("budgetId?: string"), "logProductActivity accepts budgetId");
  assert(src.includes("meta.projectId = input.projectId"), "meta carries projectId");
  assert(src.includes("meta.quoteId = input.quoteId"), "meta carries quoteId");
  assert(src.includes("meta.budgetId = input.budgetId"), "meta carries budgetId");
  console.log("✓ product CRM activity meta");
}

function checkProductBridgePassesIds() {
  const bridge = read("lib/crm/crm.product-bridge.ts");
  assert(
    bridge.includes("projectId: input.projectId") &&
      bridge.includes("quoteId: input.quoteId"),
    "quote bridge passes projectId/quoteId",
  );
  assert(
    bridge.includes("quoteId: input.quoteId") &&
      bridge.includes("budgetId: input.budgetId"),
    "budget bridge passes quoteId/budgetId",
  );
  assert(
    bridge.includes("select: { projectId: true }"),
    "budget bridge resolves projectId from quote",
  );
  assert(
    bridge.includes("select: { budgetId: true }"),
    "tender bridge resolves budgetId from tender",
  );
  assert(
    bridge.includes("projectId: input.projectId") &&
      bridge.includes("quoteId: input.quoteId"),
    "tender bridge passes projectId/quoteId",
  );
  console.log("✓ product → CRM bridge IDs");
}

function checkBridgeModule() {
  const src = read("lib/product/commercial-context-bridge.ts");
  assert(
    src.includes("export async function resolveProductContextForCustomer"),
    "resolveProductContextForCustomer exported",
  );
  assert(src.includes("getCustomerById"), "resolver validates customer tenancy");
  assert(!src.includes("writeStoredProductContext"), "resolver does not write session");
  assert(!src.includes("action-delivery"), "resolver not coupled to EADS");
  console.log("✓ commercial context bridge module");
}

function checkFrozenSurfacesUntouched() {
  const commercialContext = read("app/(product)/commercial-context.ts");
  assert(
    !commercialContext.includes("resolveProductContextForCustomer"),
    "commercial-context.ts unchanged by bridge export",
  );
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  assert(!eads.includes("commercial-context-bridge"), "EADS not coupled to bridge");
  assert(!eac.includes("commercial-context-bridge"), "EAC not coupled to bridge");
  console.log("✓ frozen surfaces untouched");
}

async function checkRuntimeResolve() {
  const org = await prisma.organization.upsert({
    where: { slug: TEST_ORG_SLUG },
    create: { name: "Product Context Bridge Verify", slug: TEST_ORG_SLUG },
    update: {},
  });

  const customer = await createCustomer({
    organizationId: org.id,
    name: `PCB Verify ${Date.now()}`,
  });

  await logProductActivity({
    customerId: customer.id,
    product: "quote",
    resourceId: "q-verify-1",
    organizationId: org.id,
    projectId: "p-verify-1",
    quoteId: "q-verify-1",
  });

  await logProductActivity({
    customerId: customer.id,
    product: "budget",
    resourceId: "b-verify-1",
    organizationId: org.id,
    projectId: "p-verify-1",
    quoteId: "q-verify-1",
    budgetId: "b-verify-1",
  });

  const resolved = await resolveProductContextForCustomer(org.id, customer.id);
  assert(resolved !== null, "resolver returns context");
  assert(resolved!.organizationId === org.id, "organizationId preserved");
  assert(resolved!.projectId === "p-verify-1", "projectId resolved");
  assert(resolved!.quoteId === "q-verify-1", "quoteId resolved");
  assert(resolved!.budgetId === "b-verify-1", "budgetId resolved");

  const wrongOrg = await resolveProductContextForCustomer("org-nonexistent", customer.id);
  assert(wrongOrg === null, "wrong organization returns null");

  const emptyCustomer = await createCustomer({
    organizationId: org.id,
    name: `PCB Empty ${Date.now()}`,
  });
  const emptyCtx = await resolveProductContextForCustomer(org.id, emptyCustomer.id);
  assert(emptyCtx === null, "customer without product activities returns null");

  console.log("✓ runtime resolveProductContextForCustomer");
}

async function main() {
  checkActivityTrackerMeta();
  checkProductBridgePassesIds();
  checkBridgeModule();
  checkFrozenSurfacesUntouched();
  await checkRuntimeResolve();
  console.log("\n✓ Commercial Context Bridge v1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
