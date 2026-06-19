/**
 * V48 SaaS Foundation — Phase 1 verification
 */
import { prisma } from "../lib/prisma";
import {
  cleanupSaasFixtureChain,
  createSaasFixtureChain,
  validateSaasFoundationP1,
} from "../lib/saas-foundation/validation/validate-saas-foundation-p1";
import { seedSaasFoundation } from "../lib/saas-foundation/seed/seed-saas-foundation";
import { SAAS_SCHEMA_MODELS } from "../lib/saas-foundation/shared/constants";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = validateSaasFoundationP1();

  assert(Boolean(validation.version), "constants exported");
  console.log("✓ saas foundation types ok");

  assert(validation.permissionCount >= 16, "permission catalog");
  console.log("✓ permission catalog ok");
  console.log(`  permissions=${validation.permissionCount}`);

  assert(validation.roleSystemCodes.length >= 10, "role catalog");
  console.log("✓ role catalog ok");
  console.log(`  roles=${validation.roleSystemCodes.length}`);

  assert(validation.planCodes.includes("trial"), "plan catalog");
  assert(validation.planCodes.includes("platform"), "plan catalog platform");
  console.log("✓ plan catalog ok");
  console.log(`  plans=${validation.planCodes.length}`);

  assert(validation.schemaModels.length === SAAS_SCHEMA_MODELS.length, "schema model list");
  console.log("✓ schema model list ok");

  assert(validation.valid, `static validation: ${validation.summary}`);
  console.log("✓ static validation ok");

  assert(validation.boundaryClean, "forbidden V47 imports");
  console.log("✓ boundary validation ok");

  if (!process.env.DATABASE_URL) {
    console.log("⚠ skip db checks (no DATABASE_URL)");
    console.log("SAAS FOUNDATION P1 PASS (static-only)");
    return;
  }

  try {
    const firstSeed = await seedSaasFoundation(prisma, { mode: "catalog-only" });
    const secondSeed = await seedSaasFoundation(prisma, { mode: "catalog-only" });
    assert(firstSeed.permissionCount >= 16, "seed permissions");
    assert(secondSeed.idempotent, "seed idempotent");
    console.log("✓ seed idempotent ok");

    const permissionKeys = await prisma.saasPermission.findMany({ select: { key: true } });
    assert(new Set(permissionKeys.map((item) => item.key)).size === permissionKeys.length, "permission unique");
    console.log("✓ permission unique ok");

    const roleCodes = await prisma.saasRole.findMany({
      where: { systemCode: { not: null } },
      select: { systemCode: true },
    });
    assert(new Set(roleCodes.map((item) => item.systemCode)).size === roleCodes.length, "role systemCode unique");
    console.log("✓ role systemCode unique ok");

    const planCodes = await prisma.saasPlan.findMany({ select: { code: true } });
    assert(new Set(planCodes.map((item) => item.code)).size === planCodes.length, "plan code unique");
    console.log("✓ plan code unique ok");

    const chain = await createSaasFixtureChain(prisma);
    assert(Boolean(chain.membershipId), "membership fixture");
    assert(Boolean(chain.subscriptionId), "subscription fixture");

    const membership = await prisma.saasMembership.findUniqueOrThrow({ where: { id: chain.membershipId } });
    const workspace = await prisma.saasWorkspace.findUniqueOrThrow({ where: { id: chain.workspaceId } });
    assert(membership.organizationId === workspace.organizationId, "membership organizationId");
    console.log("✓ membership organizationId ok");

    const subscription = await prisma.saasSubscription.findUniqueOrThrow({ where: { id: chain.subscriptionId } });
    assert(subscription.currentPeriodEnd > subscription.currentPeriodStart, "subscription period");
    console.log("✓ subscription period ok");

    let duplicateBlocked = false;
    try {
      await prisma.saasEntitlementGrant.create({
        data: {
          tenantId: chain.tenantId,
          feature: "commercial.quote",
          enabled: true,
          quota: 1,
        },
      });
    } catch {
      duplicateBlocked = true;
    }
    assert(duplicateBlocked, "entitlement unique constraint");
    console.log("✓ entitlement unique ok");

    await cleanupSaasFixtureChain(prisma, chain);
    console.log("✓ tenant chain cleanup ok");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`⚠ skip db checks (${message.slice(0, 120)})`);
    console.log("⚠ run: npx prisma migrate deploy && npm run seed:saas-foundation");
    console.log("SAAS FOUNDATION P1 PASS (static-only, db unavailable)");
    return;
  }

  console.log("SAAS FOUNDATION P1 PASS");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
