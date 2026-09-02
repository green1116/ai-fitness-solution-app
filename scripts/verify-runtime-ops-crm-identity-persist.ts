/**
 * WP-RUNTIME-OPS-CRM-IDENTITY-PERSIST-1 — Ops ↔ CRM identity persistence verification
 */
import fs from "node:fs";
import path from "node:path";

import { createCustomer } from "../lib/crm/customer/customer.service";
import { prisma } from "../lib/prisma";
import { resolveCrmCustomerIdForOpsCustomer } from "../lib/product/runtime-ops-product-context-adapter";
import {
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
  RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
} from "../lib/product/runtime-ops-crm-identity-registry";
import {
  linkOpsCrmIdentity,
  lookupOpsCrmIdentityLink,
  unlinkOpsCrmIdentity,
} from "../lib/product/runtime-ops-crm-identity-store";

const ROOT = path.resolve(__dirname, "..");
const PERSIST_ORG_SLUG = "runtime-ops-crm-identity-persist-v1-verify";
const PERSIST_OPS_ID = "cust-pg21-expansion-01";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkSchemaAndStore() {
  const schema = read("prisma/schema.prisma");
  assert(schema.includes("model OpsCrmIdentityLink"), "OpsCrmIdentityLink model exists");
  assert(
    schema.includes("@@unique([organizationId, opsCustomerId])"),
    "tenant-scoped ops uniqueness",
  );

  const store = read("lib/product/runtime-ops-crm-identity-store.ts");
  assert(store.includes("export async function lookupOpsCrmIdentityLink"), "store lookup exported");
  assert(store.includes("export async function linkOpsCrmIdentity"), "store link exported");
  assert(store.includes("export async function unlinkOpsCrmIdentity"), "store unlink exported");
  assert(store.includes("getCustomerById"), "store validates CRM tenancy on link");
  assert(!store.includes("findOrCreateCustomer"), "store not name-based");
  console.log("✓ schema and identity store");
}

function checkAdapterWiring() {
  const adapter = read("lib/product/runtime-ops-product-context-adapter.ts");
  assert(adapter.includes("lookupOpsCrmIdentitySeed"), "adapter uses seed registry");
  assert(adapter.includes("lookupOpsCrmIdentityLink"), "adapter uses DB store");
  assert(adapter.includes("getCustomerById"), "adapter validates CRM tenancy");
  console.log("✓ adapter seed -> DB -> tenancy validation");
}

function checkLinkApi() {
  const route = read("app/api/runtime-ops/crm-identity/link/route.ts");
  assert(route.includes("runSaasOrgGate"), "link API gated");
  assert(route.includes("linkOpsCrmIdentity"), "link API uses store");
  assert(route.includes("opsCustomerId"), "link API requires opsCustomerId");
  assert(route.includes("crmCustomerId"), "link API requires crmCustomerId");
  console.log("✓ link API route");
}

function checkFrozenLayersUntouched() {
  const eads = read("lib/commercial/action-delivery/action-delivery.ts");
  const eac = read("lib/commercial/action-consumption/action-consumption.ts");
  const ewas = read("lib/workflow/experience/workspace-action-surface.ts");
  const commercialContext = read("app/(product)/commercial-context.ts");
  assert(!eads.includes("OpsCrmIdentityLink"), "EADS untouched");
  assert(!eac.includes("OpsCrmIdentityLink"), "EAC untouched");
  assert(!ewas.includes("OpsCrmIdentityLink"), "EWAS untouched");
  assert(!commercialContext.includes("OpsCrmIdentityLink"), "journey context untouched");
  console.log("✓ frozen layers untouched");
}

async function ensureOpsCrmIdentityLinkSchema() {
  await prisma.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS "ops_crm_identity_link" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "opsCustomerId" TEXT NOT NULL,
    "crmCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ops_crm_identity_link_pkey" PRIMARY KEY ("id")
);
  `);
  await prisma.$executeRawUnsafe(`
CREATE UNIQUE INDEX IF NOT EXISTS "ops_crm_identity_link_organizationId_opsCustomerId_key"
ON "ops_crm_identity_link"("organizationId", "opsCustomerId");
  `);
  await prisma.$executeRawUnsafe(`
CREATE INDEX IF NOT EXISTS "ops_crm_identity_link_organizationId_idx"
ON "ops_crm_identity_link"("organizationId");
  `);
  await prisma.$executeRawUnsafe(`
CREATE INDEX IF NOT EXISTS "ops_crm_identity_link_crmCustomerId_idx"
ON "ops_crm_identity_link"("crmCustomerId");
  `);
  await prisma.$executeRawUnsafe(`
DO $$ BEGIN
  ALTER TABLE "ops_crm_identity_link"
    ADD CONSTRAINT "ops_crm_identity_link_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `);
  await prisma.$executeRawUnsafe(`
DO $$ BEGIN
  ALTER TABLE "ops_crm_identity_link"
    ADD CONSTRAINT "ops_crm_identity_link_crmCustomerId_fkey"
    FOREIGN KEY ("crmCustomerId") REFERENCES "crm_customer"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
  `);
}

async function upsertPersistOrg() {
  return prisma.organization.upsert({
    where: { slug: PERSIST_ORG_SLUG },
    create: {
      slug: PERSIST_ORG_SLUG,
      name: "Runtime Ops CRM Identity Persist Verify",
    },
    update: {},
  });
}

async function checkRuntimePersistence() {
  await ensureOpsCrmIdentityLinkSchema();
  const org = await upsertPersistOrg();
  const customer = await createCustomer({
    organizationId: org.id,
    name: `Ops Persist Customer ${Date.now()}`,
  });

  await unlinkOpsCrmIdentity({
    organizationId: org.id,
    opsCustomerId: PERSIST_OPS_ID,
  });

  assert(
    (await lookupOpsCrmIdentityLink(org.id, PERSIST_OPS_ID)) === null,
    "lookup returns null before link",
  );

  const link = await linkOpsCrmIdentity({
    organizationId: org.id,
    opsCustomerId: PERSIST_OPS_ID,
    crmCustomerId: customer.id,
  });
  assert(link.crmCustomerId === customer.id, "link stores crm customer id");

  const resolved = await resolveCrmCustomerIdForOpsCustomer(org.id, PERSIST_OPS_ID);
  assert(resolved === customer.id, "adapter resolves persisted link");

  const relinkCustomer = await createCustomer({
    organizationId: org.id,
    name: `Ops Persist Customer Relink ${Date.now()}`,
  });
  const relinked = await linkOpsCrmIdentity({
    organizationId: org.id,
    opsCustomerId: PERSIST_OPS_ID,
    crmCustomerId: relinkCustomer.id,
  });
  assert(relinked.crmCustomerId === relinkCustomer.id, "link upsert updates crm customer id");

  const unlinked = await unlinkOpsCrmIdentity({
    organizationId: org.id,
    opsCustomerId: PERSIST_OPS_ID,
  });
  assert(unlinked, "unlink removes persisted link");
  assert(
    (await resolveCrmCustomerIdForOpsCustomer(org.id, PERSIST_OPS_ID)) === null,
    "adapter returns null after unlink",
  );

  let rejected = false;
  try {
    await linkOpsCrmIdentity({
      organizationId: org.id,
      opsCustomerId: PERSIST_OPS_ID,
      crmCustomerId: "crm-nonexistent",
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "invalid crm customer id rejected on link");

  const otherOrg = await prisma.organization.upsert({
    where: { slug: "runtime-ops-crm-identity-persist-other" },
    create: {
      slug: "runtime-ops-crm-identity-persist-other",
      name: "Other Org",
    },
    update: {},
  });
  assert(
    (await resolveCrmCustomerIdForOpsCustomer(otherOrg.id, PERSIST_OPS_ID)) === null,
    "cross-org ops lookup returns null",
  );

  assert(
    (await resolveCrmCustomerIdForOpsCustomer(
      RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
      RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
    )) !== null,
    "verify seed mapping still resolves alongside DB layer",
  );

  console.log("✓ runtime persistence link/unlink and adapter resolution");
}

async function main() {
  checkSchemaAndStore();
  checkAdapterWiring();
  checkLinkApi();
  checkFrozenLayersUntouched();
  await checkRuntimePersistence();
  console.log("\n✓ WP-RUNTIME-OPS-CRM-IDENTITY-PERSIST-1 — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
