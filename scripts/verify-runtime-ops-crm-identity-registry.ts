/**
 * WP-RUNTIME-OPS-CRM-IDENTITY-REGISTRY-1 — explicit Ops ↔ CRM identity registry verification
 */
import fs from "node:fs";
import path from "node:path";

import { prisma } from "../lib/prisma";
import { getCustomerById } from "../lib/crm/customer/customer.service";
import {
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
  listOpsCrmIdentitySeeds,
  lookupOpsCrmIdentitySeed,
  runtimeOpsCrmIdentityRegistryFingerprint,
} from "../lib/product/runtime-ops-crm-identity-registry";

const ROOT = path.resolve(__dirname, "..");
const VERIFY_ORG_SLUG = "runtime-ops-crm-identity-v1-verify";
const EXPECTED_FINGERPRINT =
  "b4ecd979fd399d6fba4b9069774e2b6c4d88410494a94adf1637fb431db347f5";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkRegistryModule() {
  const src = read("lib/product/runtime-ops-crm-identity-registry.ts");
  assert(src.includes("export function lookupOpsCrmIdentitySeed"), "lookup exported");
  assert(src.includes("EXPLICIT_IDENTITY_SEEDS"), "explicit seeds defined");
  assert(!src.includes("findOrCreateCustomer"), "registry not name-based");
  assert(!src.includes("companyName"), "registry not name-based");
  assert(!src.includes("prisma"), "registry has no DB access");
  assert(!src.includes("action-delivery"), "registry not coupled to EADS");
  assert(!src.includes("action-consumption"), "registry not coupled to EAC");
  console.log("✓ runtime ops CRM identity registry module");
}

function checkAdapterWiring() {
  const src = read("lib/product/runtime-ops-product-context-adapter.ts");
  assert(src.includes("lookupOpsCrmIdentitySeed"), "adapter uses registry");
  assert(src.includes("getCustomerById"), "adapter validates CRM tenancy");
  assert(!src.includes("findOrCreateCustomer"), "adapter not name-based");
  console.log("✓ adapter wired to registry with tenancy validation");
}

function checkDeterministicSeeds() {
  const seeds = listOpsCrmIdentitySeeds();
  assert(seeds.length === 1, "single explicit verify seed");
  assert(
    seeds[0]?.organizationId === RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    "verify org id",
  );
  assert(
    seeds[0]?.opsCustomerId === RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
    "verify ops customer id",
  );
  assert(
    seeds[0]?.crmCustomerId === RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    "verify crm customer id",
  );

  const fp = runtimeOpsCrmIdentityRegistryFingerprint();
  assert(fp.length === 64, "registry fingerprint is sha256 hex");
  assert(fp === EXPECTED_FINGERPRINT, "registry fingerprint stable");

  assert(
    lookupOpsCrmIdentitySeed("org1", "cust-pg21-alpha") === null,
    "unmapped ops customer returns null",
  );
  assert(
    lookupOpsCrmIdentitySeed(RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID, "cust-pg21-alpha") ===
      null,
    "unmapped ops id for verify org returns null",
  );
  assert(
    lookupOpsCrmIdentitySeed("org1", RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID) ===
      null,
    "mapped ops id wrong org returns null",
  );
  console.log("✓ deterministic explicit seed mapping");
}

async function upsertVerifyOrg() {
  return prisma.organization.upsert({
    where: { slug: VERIFY_ORG_SLUG },
    create: {
      id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
      slug: VERIFY_ORG_SLUG,
      name: "Runtime Ops CRM Identity Verify",
    },
    update: {},
  });
}

async function upsertVerifyCustomer(organizationId: string) {
  return prisma.customer.upsert({
    where: { id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID },
    create: {
      id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
      organizationId,
      name: "Ops CRM Identity Verify Customer",
      industry: "",
      status: "ACTIVE",
    },
    update: {
      organizationId,
      name: "Ops CRM Identity Verify Customer",
      status: "ACTIVE",
    },
  });
}

async function checkRuntimeValidation() {
  const org = await upsertVerifyOrg();
  assert(org.id === RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID, "verify org id persisted");

  const mapped = lookupOpsCrmIdentitySeed(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  );
  assert(
    mapped === RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    "seed lookup returns crm customer id",
  );

  await prisma.customer.deleteMany({
    where: { id: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID },
  });

  const missing = await getCustomerById(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
  );
  assert(missing === null, "crm customer absent before seed");

  await upsertVerifyCustomer(org.id);
  const customer = await getCustomerById(
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
    RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
  );
  assert(customer?.id === RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID, "crm customer seeded");
  console.log("✓ runtime CRM tenancy validation path");
}

async function main() {
  checkRegistryModule();
  checkAdapterWiring();
  checkDeterministicSeeds();
  await checkRuntimeValidation();
  console.log("\n✓ WP-RUNTIME-OPS-CRM-IDENTITY-REGISTRY-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
