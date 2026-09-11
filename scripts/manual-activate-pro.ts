/**
 * Production operator: offline payment confirmed → BASIC → PRO for one organization.
 *
 * Dry-run by default. Pass --confirm to mutate.
 *
 * Usage:
 *   npx tsx scripts/manual-activate-pro.ts --organizationId <orgId>
 *   npx tsx scripts/manual-activate-pro.ts --organizationId <orgId> --confirm
 */
import "dotenv/config";

import { updateSubscriptionStatus } from "../lib/billing/subscription/subscription.updater";
import { getActiveSubscriptionForOrganization } from "../lib/billing/subscription/subscription.resolver";
import { prisma } from "../lib/prisma";
import type { SaasPlan } from "../lib/saas/types";

const TARGET_PLAN = "PRO" as const;
const SOURCE_PLAN = "BASIC" as const;

function usage(): never {
  console.error(
    "Usage: npx tsx scripts/manual-activate-pro.ts --organizationId <orgId> [--confirm]",
  );
  process.exit(2);
}

function parseArgs(argv: string[]): { organizationId: string; confirm: boolean } {
  let organizationId = "";
  let confirm = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--confirm") {
      confirm = true;
      continue;
    }
    if (arg === "--organizationId" || arg === "--orgId") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) usage();
      organizationId = next.trim();
      i += 1;
      continue;
    }
    if (arg.startsWith("--organizationId=")) {
      organizationId = arg.slice("--organizationId=".length).trim();
      continue;
    }
    if (arg.startsWith("--orgId=")) {
      organizationId = arg.slice("--orgId=".length).trim();
      continue;
    }
    usage();
  }

  if (!organizationId) usage();
  return { organizationId, confirm };
}

function printResult(input: {
  orgId: string;
  currentPlan: string;
  targetPlan: string;
  result: string;
}) {
  console.log(`orgId: ${input.orgId}`);
  console.log(`currentPlan: ${input.currentPlan}`);
  console.log(`targetPlan: ${input.targetPlan}`);
  console.log(`result: ${input.result}`);
}

function reject(orgId: string, currentPlan: string, reason: string): never {
  printResult({
    orgId,
    currentPlan,
    targetPlan: TARGET_PLAN,
    result: `REJECTED: ${reason}`,
  });
  process.exit(1);
}

function resolveEffectivePlan(activePlan: SaasPlan | undefined): SaasPlan {
  return activePlan ?? SOURCE_PLAN;
}

async function main() {
  const { organizationId, confirm } = parseArgs(process.argv.slice(2));

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  });
  if (!org) {
    reject(organizationId, "UNKNOWN", "organization not found");
  }

  const active = await getActiveSubscriptionForOrganization(organizationId);
  const currentPlan = resolveEffectivePlan(active?.plan);

  if (active && active.status !== "ACTIVE") {
    reject(organizationId, currentPlan, `invalid subscription status ${active.status}`);
  }

  if (currentPlan === "PRO") {
    reject(organizationId, currentPlan, "already PRO");
  }
  if (currentPlan === "ENTERPRISE") {
    reject(organizationId, currentPlan, "ENTERPRISE cannot downgrade/activate via this script");
  }
  if (currentPlan !== SOURCE_PLAN) {
    reject(organizationId, currentPlan, `only ${SOURCE_PLAN} → ${TARGET_PLAN} allowed`);
  }

  if (!confirm) {
    printResult({
      orgId: organizationId,
      currentPlan,
      targetPlan: TARGET_PLAN,
      result: "DRY_RUN: would activate BASIC → PRO (pass --confirm to mutate)",
    });
    return;
  }

  const periodEnd = new Date();
  periodEnd.setUTCDate(periodEnd.getUTCDate() + 30);

  await updateSubscriptionStatus({
    organizationId,
    plan: TARGET_PLAN,
    status: "ACTIVE",
    stripeCustomerId: active?.stripeCustomerId ?? undefined,
    stripeSubscriptionId: active?.stripeSubscriptionId ?? undefined,
    currentPeriodEnd: periodEnd,
  });

  const after = await getActiveSubscriptionForOrganization(organizationId);
  if (!after || after.plan !== TARGET_PLAN || after.status !== "ACTIVE") {
    reject(
      organizationId,
      after?.plan ?? currentPlan,
      "activation failed: active subscription is not PRO",
    );
  }

  printResult({
    orgId: organizationId,
    currentPlan,
    targetPlan: TARGET_PLAN,
    result: "ACTIVATED: BASIC → PRO",
  });
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
