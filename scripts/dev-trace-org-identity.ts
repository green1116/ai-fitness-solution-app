/**
 * Dev-only: trace organizationId across seed / portal / API gate paths.
 *
 * Usage:
 *   DEV_USER_EMAIL=you@example.com npm run dev:trace-org-identity
 */
import { getActiveSubscription } from "@/lib/billing/subscription.service";
import { extractOrganizationId } from "@/lib/auth/auth.service";
import { prisma } from "@/lib/prisma";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { getOnboardingProfile } from "@/lib/portal/v57/onboarding.store";

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refused: dev:trace-org-identity cannot run in production.");
  }
}

async function resolveSeedOrganizationId(): Promise<{ id: string; source: string }> {
  const byId = process.env.DEV_ORGANIZATION_ID?.trim();
  if (byId) return { id: byId, source: "DEV_ORGANIZATION_ID" };

  const email = process.env.DEV_USER_EMAIL?.trim();
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        organizationMembers: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { organizationId: true },
        },
      },
    });
    const orgId = user?.organizationMembers[0]?.organizationId;
    if (!orgId) throw new Error(`User ${email} has no organization membership.`);
    return { id: orgId, source: "DEV_USER_EMAIL → first membership" };
  }

  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!org) throw new Error("No organization in database.");
  return { id: org.id, source: "fallback: global findFirst(createdAt asc)" };
}

async function resolvePortalOrganizationId(email: string): Promise<{
  id: string | null;
  source: string;
}> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return { id: null, source: "user not found" };

  const orgs = await listOrganizationsForUser(user.id);
  const primary = orgs[0];
  const profile = getOnboardingProfile(user.id);

  if (primary) {
    return { id: primary.organization.id, source: "listOrganizationsForUser[0]" };
  }
  if (profile?.organizationId) {
    return { id: profile.organizationId, source: "onboarding.store profile (no membership)" };
  }
  return { id: null, source: "none" };
}

async function printSubscription(orgId: string, label: string) {
  const sub = await getActiveSubscription(orgId);
  if (!sub) {
    console.log(`  ${label}: (no ACTIVE subscription)`);
    return;
  }
  console.log(`  ${label}: plan=${sub.plan} status=${sub.status} id=${sub.id}`);
}

async function main() {
  assertNotProduction();

  const email = process.env.DEV_USER_EMAIL?.trim();
  const seed = await resolveSeedOrganizationId();

  console.log("=== organizationId trace ===\n");
  console.log(`1. dev-seed-pro-subscription`);
  console.log(`   organizationId: ${seed.id}`);
  console.log(`   source: ${seed.source}`);
  await printSubscription(seed.id, "subscription");

  if (email) {
    const portal = await resolvePortalOrganizationId(email);
    console.log(`\n2. getPortalUserContext() [user=${email}]`);
    console.log(`   organizationId: ${portal.id ?? "null"}`);
    console.log(`   source: ${portal.source}`);
    if (portal.id) await printSubscription(portal.id, "subscription");

    console.log(`\n3. quote/generate body (from auth/me → quote page state)`);
    console.log(`   organizationId: ${portal.id ?? "null"}`);
    console.log(`   (same as getPortalUserContext — page copies auth/me)`);

    const mockBody = portal.id ? { organizationId: portal.id } : {};
    const gateOrg = extractOrganizationId({ headers: new Headers() } as import("next/server").NextRequest, mockBody);
    console.log(`\n4. runSaasApiGate → authenticateRequest → getActiveSubscription`);
    console.log(`   organizationId: ${gateOrg ?? "null"} (extractOrganizationId from body)`);
    if (gateOrg) await printSubscription(gateOrg, "subscription");
  } else {
    console.log("\n2–4. Set DEV_USER_EMAIL to compare portal / quote / gate paths for logged-in user.");
  }

  const allOrgs = await prisma.organization.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, subscriptions: { where: { status: "ACTIVE" }, select: { plan: true } } },
  });
  console.log("\n--- all organizations ---");
  for (const o of allOrgs) {
    const sub = o.subscriptions[0];
    console.log(
      `  ${o.id}  ${o.name}  ACTIVE=${sub ? sub.plan : "none"}`,
    );
  }

  if (email) {
    const portal = await resolvePortalOrganizationId(email);
    const match = portal.id === seed.id;
    console.log(`\n=== result: seed vs portal/gate ${match ? "MATCH" : "MISMATCH"} ===`);
    if (!match) {
      console.log(`  seed targets:  ${seed.id} (${seed.source})`);
      console.log(`  API uses:      ${portal.id} (${portal.source})`);
      process.exitCode = 1;
    }
  } else if (seed.source.startsWith("fallback:")) {
    console.log("\n=== WARNING: seed used global first org; API uses logged-in user's org — likely MISMATCH ===");
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error("\nFailed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
