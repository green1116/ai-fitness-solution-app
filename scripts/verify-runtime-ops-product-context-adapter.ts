/**
 * WP-RUNTIME-OPS-PCX-ADAPTER-1 + WP-RUNTIME-OPS-CRM-IDENTITY-REGISTRY-1 verification
 */
import fs from "node:fs";
import path from "node:path";

import { prisma } from "../lib/prisma";
import {
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
} from "../lib/product/runtime-ops-crm-identity-registry";
import {
  resolveCrmCustomerIdForOpsCustomer,
  resolveValidatedProductContextForOpsCustomer,
} from "../lib/product/runtime-ops-product-context-adapter";

const ROOT = path.resolve(__dirname, "..");
const VERIFY_ORG_SLUG = "runtime-ops-crm-identity-v1-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkAdapterModule() {
  const src = read("lib/product/runtime-ops-product-context-adapter.ts");
  assert(
    src.includes("export async function resolveValidatedProductContextForOpsCustomer"),
    "ops adapter exported",
  );
  assert(
    src.includes("export async function resolveCrmCustomerIdForOpsCustomer"),
    "ops mapping hook exported",
  );
  assert(
    src.includes("resolveValidatedProductContextForCustomer"),
    "ops adapter reuses validated CRM resolver",
  );
  assert(src.includes("lookupOpsCrmIdentitySeed"), "adapter uses identity registry");
  assert(src.includes("getCustomerById"), "adapter validates CRM tenancy");
  assert(!src.includes("action-delivery"), "adapter not coupled to EADS");
  assert(!src.includes("action-consumption"), "adapter not coupled to EAC");
  assert(!src.includes("workspace-action-surface"), "adapter not coupled to EWAS");
  assert(!src.includes("writeStoredProductContext"), "adapter does not write session");
  assert(!src.includes("findOrCreateCustomer"), "adapter not name-based");
  console.log("✓ runtime ops product context adapter module");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const workspace = read("app/(workspace)/WorkspaceActionSurfacePanel.tsx");
  assert(!eads.includes("runtime-ops-product-context-adapter"), "EADS untouched");
  assert(!eads.includes("runtime-ops-crm-identity-registry"), "EADS untouched by registry");
  assert(!eac.includes("runtime-ops-product-context-adapter"), "EAC untouched");
  assert(!eac.includes("runtime-ops-crm-identity-registry"), "EAC untouched by registry");
  assert(!ewas.includes("runtime-ops-product-context-adapter"), "EWAS untouched");
  assert(!workspace.includes("runtime-ops-product-context-adapter"), "workspace UI untouched");
  console.log("✓ frozen runtime ops layers untouched");
}

async function checkUnmappedReturnsNull() {
  const mapping = await resolveCrmCustomerIdForOpsCustomer("org1", "cust-pg21-alpha");
  assert(mapping === null, "unmapped ops customer returns null");

  const ctx = await resolveValidatedProductContextForOpsCustomer("org1", "cust-pg21-alpha");
  assert(ctx === null, "unmapped ops resolver returns null");

  assert(
    (await resolveValidatedProductContextForOpsCustomer("", "cust-pg21-alpha")) === null,
    "empty organizationId returns null",
  );
  assert(
    (await resolveValidatedProductContextForOpsCustomer("org1", "")) === null,
    "empty opsCustomerId returns null",
  );
  console.log("✓ unmapped ops customer returns null");
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

async function checkMappedIdentityResolution() {
  await upsertVerifyOrgAndCustomer();

  const crmCustomerId = await resolveCrmCustomerIdForOpsCustomer(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(
    crmCustomerId === RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    "mapped ops customer resolves to CRM id",
  );

  const wrongOrg = await resolveCrmCustomerIdForOpsCustomer(
    "org-unmapped",
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(wrongOrg === null, "mapped ops id wrong org returns null after validation");
  console.log("✓ mapped ops customer resolves via registry + tenancy validation");
}

async function checkSeedWithoutDbCustomerReturnsNull() {
  const orphanOrgId = "org-runtime-ops-crm-identity-orphan";
  await prisma.organization.upsert({
    where: { slug: "runtime-ops-crm-identity-orphan-verify" },
    create: {
      id: orphanOrgId,
      slug: "runtime-ops-crm-identity-orphan-verify",
      name: "Orphan Org",
    },
    update: {},
  });

  const result = await resolveCrmCustomerIdForOpsCustomer(
    orphanOrgId,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(result === null, "seed miss for org without registry entry returns null");
  console.log("✓ registry miss returns null without CRM fallback");
}

async function main() {
  checkAdapterModule();
  checkFrozenLayersUntouched();
  await checkUnmappedReturnsNull();
  await checkMappedIdentityResolution();
  await checkSeedWithoutDbCustomerReturnsNull();
  console.log("\n✓ WP-RUNTIME-OPS-PCX-ADAPTER-1 + IDENTITY-REGISTRY-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
