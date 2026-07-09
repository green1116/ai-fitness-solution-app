/**
 * Dev-only: ensure ACTIVE PRO subscription for a test organization.
 * Idempotent — safe to rerun.
 *
 * Usage:
 *   npm run dev:seed-pro-subscription
 *   DEV_USER_EMAIL=you@example.com npm run dev:seed-pro-subscription
 *   DEV_ORGANIZATION_ID=org_xxx npm run dev:seed-pro-subscription
 */
import { checkFeatureAccess } from "@/lib/feature-flags/feature-gate";
import { getActiveSubscription } from "@/lib/billing/subscription.service";
import { prisma } from "@/lib/prisma";

const DEV_PLAN = "PRO" as const;

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refused: dev:seed-pro-subscription cannot run in production.");
  }
}

function periodEndOneYearFromNow(): Date {
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  return end;
}

async function resolveOrganizationId(): Promise<{ id: string; name: string }> {
  const byId = process.env.DEV_ORGANIZATION_ID?.trim();
  if (byId) {
    const org = await prisma.organization.findUnique({
      where: { id: byId },
      select: { id: true, name: true },
    });
    if (!org) throw new Error(`Organization not found: ${byId}`);
    return org;
  }

  const email = process.env.DEV_USER_EMAIL?.trim();
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        organizationMembers: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { organization: { select: { id: true, name: true } } },
        },
      },
    });
    if (!user) throw new Error(`User not found: ${email}`);
    const org = user.organizationMembers[0]?.organization;
    if (!org) throw new Error(`User ${email} has no organization membership.`);
    return org;
  }

  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (!org) throw new Error("No organization in database. Complete onboarding first.");
  console.warn(
    "[dev-seed] WARNING: no DEV_USER_EMAIL / DEV_ORGANIZATION_ID — using global oldest org.",
    "This may not match your logged-in session. Prefer: DEV_USER_EMAIL=you@example.com npm run dev:seed-pro-subscription",
  );
  return org;
}

async function ensureProSubscription(organizationId: string) {
  const currentPeriodEnd = periodEndOneYearFromNow();
  const active = await getActiveSubscription(organizationId);

  if (active?.status === "ACTIVE" && active.plan === DEV_PLAN) {
    const updated = await prisma.subscription.update({
      where: { id: active.id },
      data: { currentPeriodEnd },
    });
    return { action: "refreshed" as const, subscription: updated };
  }

  if (active) {
    await prisma.subscription.update({
      where: { id: active.id },
      data: { status: "CANCELED" },
    });
  }

  const created = await prisma.subscription.create({
    data: {
      organizationId,
      plan: DEV_PLAN,
      status: "ACTIVE",
      currentPeriodEnd,
    },
  });
  return { action: active ? "replaced" as const : "created" as const, subscription: created };
}

async function main() {
  assertNotProduction();

  const org = await resolveOrganizationId();
  console.log(`Target organization: ${org.name} (${org.id})`);

  const { action, subscription } = await ensureProSubscription(org.id);
  console.log(`Subscription ${action}: id=${subscription.id} plan=${subscription.plan} status=${subscription.status}`);
  console.log(`currentPeriodEnd=${subscription.currentPeriodEnd?.toISOString() ?? "null"}`);

  const gate = await checkFeatureAccess(org.id, "canGenerateQuote");
  if (!gate.allowed) {
    throw new Error(`Feature gate still denied: ${gate.reason ?? "unknown"}`);
  }

  console.log(`Feature gate OK: canGenerateQuote allowed on ${gate.plan} plan`);
  console.log("\n✅ Dev PRO subscription ready — /api/quote/generate subscription gate will pass.");
}

main()
  .catch((e) => {
    console.error("\nFailed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
