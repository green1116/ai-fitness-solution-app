/**
 * CRM Consult Duplicate Reconciliation v1 — one-time.
 *
 * Scope: 4 duplicate Opportunities only (INIT → LOST) via updateOpportunityStage.
 * Default: dry-run. Set CRM_CONSULT_DUP_RECONCILE_EXECUTE=1 to apply.
 *
 * Does NOT delete, does NOT modify survivor CrmLead, does NOT change customerId/leadId.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { updateOpportunityStage } from "../lib/crm/opportunity/opportunity.service";

const REASON = "duplicate_consult_reconciliation" as const;

type Target = {
  opportunityId: string;
  customerId: string;
  duplicateLeadId: string;
  survivorLeadId: string;
  marketingLeadId: string;
};

/** Frozen allow-list from post-hardening consult dup audit. */
const TARGETS: readonly Target[] = [
  {
    opportunityId: "cmt5hitet0031hhkkjlfq2q4t",
    customerId: "cmt5him8l002jhhkkyp9x1yjd",
    duplicateLeadId: "cmt5hiroz002xhhkk9wh5ld29",
    survivorLeadId: "cmt5himx8002nhhkk1kd8wic2",
    marketingLeadId: "cmt5hil0s002hhhkka4crxmhg",
  },
  {
    opportunityId: "cmt5i5d910055hhkky92t4sas",
    customerId: "cmt5i50qk004jhhkkefl45ovk",
    duplicateLeadId: "cmt5i59va004xhhkktn9p5a29",
    survivorLeadId: "cmt5i51f7004nhhkknyglhj50",
    marketingLeadId: "cmt5i4z04004hhhkk7wl05swj",
  },
  {
    opportunityId: "cmt5i5dl30057hhkkshes292p",
    customerId: "cmt5i50qk004jhhkkefl45ovk",
    duplicateLeadId: "cmt5i5aat004zhhkkcs3epdj1",
    survivorLeadId: "cmt5i51f7004nhhkknyglhj50",
    marketingLeadId: "cmt5i4z04004hhhkk7wl05swj",
  },
  {
    opportunityId: "cmt5kf715007nhhkk48oht1m4",
    customerId: "cmt5kervj006zhhkke4y8v85u",
    duplicateLeadId: "cmt5kf3ls007fhhkkjdqvwcd7",
    survivorLeadId: "cmt5kf391007dhhkkdp1l8fl6",
    marketingLeadId: "cmt5keols0006hhbcipk2q2l7",
  },
];

type VerifyOk =
  | { action: "skip"; opportunityId: string; reason: string }
  | {
      action: "apply";
      opportunityId: string;
      customerId: string;
      survivorLeadId: string;
      marketingLeadId: string;
    };

function metaOf(row: { meta: unknown }): Record<string, unknown> {
  if (!row.meta || typeof row.meta !== "object" || Array.isArray(row.meta)) return {};
  return row.meta as Record<string, unknown>;
}

async function verifyTarget(target: Target): Promise<VerifyOk> {
  return prisma.$transaction(async (tx) => {
    const opportunity = await tx.opportunity.findFirst({
      where: { id: target.opportunityId },
    });
    if (!opportunity) {
      throw new Error(`FAIL_CLOSED: opportunity missing ${target.opportunityId}`);
    }

    if (opportunity.customerId !== target.customerId) {
      throw new Error(
        `FAIL_CLOSED: customerId mismatch opp=${target.opportunityId} got=${opportunity.customerId} expected=${target.customerId}`,
      );
    }
    if (opportunity.leadId !== target.duplicateLeadId) {
      throw new Error(
        `FAIL_CLOSED: leadId mismatch opp=${target.opportunityId} got=${opportunity.leadId} expected=${target.duplicateLeadId}`,
      );
    }

    const survivor = await tx.crmLead.findFirst({
      where: { id: target.survivorLeadId },
    });
    if (!survivor) {
      throw new Error(`FAIL_CLOSED: survivor missing ${target.survivorLeadId}`);
    }
    if (survivor.customerId !== target.customerId) {
      throw new Error(
        `FAIL_CLOSED: survivor customerId mismatch ${target.survivorLeadId}`,
      );
    }

    const duplicateLead = await tx.crmLead.findFirst({
      where: { id: target.duplicateLeadId },
    });
    if (!duplicateLead) {
      throw new Error(`FAIL_CLOSED: duplicate lead missing ${target.duplicateLeadId}`);
    }
    if (duplicateLead.customerId !== target.customerId) {
      throw new Error(
        `FAIL_CLOSED: duplicate lead customerId mismatch ${target.duplicateLeadId}`,
      );
    }

    const leadCreated = await tx.cRMActivity.findMany({
      where: {
        customerId: target.customerId,
        type: "lead.created",
      },
      take: 500,
    });
    const marketingMatch = leadCreated.some((a) => {
      const m = metaOf(a);
      return (
        m.leadId === target.duplicateLeadId &&
        m.marketingLeadId === target.marketingLeadId
      );
    });
    if (!marketingMatch) {
      throw new Error(
        `FAIL_CLOSED: marketingLeadId not verified for lead=${target.duplicateLeadId} marketingLeadId=${target.marketingLeadId}`,
      );
    }

    const stage = String(opportunity.stage).toUpperCase();
    if (stage === "LOST") {
      return {
        action: "skip" as const,
        opportunityId: target.opportunityId,
        reason: "already_LOST",
      };
    }
    if (stage !== "INIT") {
      throw new Error(
        `FAIL_CLOSED: stage not INIT (got ${opportunity.stage}) opp=${target.opportunityId}`,
      );
    }

    return {
      action: "apply" as const,
      opportunityId: target.opportunityId,
      customerId: target.customerId,
      survivorLeadId: target.survivorLeadId,
      marketingLeadId: target.marketingLeadId,
    };
  });
}

async function applyTarget(target: Target): Promise<void> {
  // Re-verify immediately before mutate (fail-closed / idempotent).
  const verified = await verifyTarget(target);
  if (verified.action === "skip") {
    console.log(JSON.stringify({ status: "skipped", ...verified }));
    return;
  }

  await updateOpportunityStage({
    opportunityId: target.opportunityId,
    stage: "LOST",
    reason: REASON,
    survivorLeadId: target.survivorLeadId,
    marketingLeadId: target.marketingLeadId,
  });

  const after = await prisma.opportunity.findFirst({
    where: { id: target.opportunityId },
  });
  if (!after || String(after.stage).toUpperCase() !== "LOST") {
    throw new Error(`POSTCHECK_FAIL: stage not LOST after update ${target.opportunityId}`);
  }
  if (after.customerId !== target.customerId || after.leadId !== target.duplicateLeadId) {
    throw new Error(`POSTCHECK_FAIL: customerId/leadId mutated ${target.opportunityId}`);
  }

  const activities = await prisma.cRMActivity.findMany({
    where: { customerId: target.customerId, type: "opportunity.stage_updated" },
    orderBy: { timestamp: "desc" },
    take: 50,
  });
  const evidence = activities.find((a) => {
    const m = metaOf(a);
    return (
      m.opportunityId === target.opportunityId &&
      m.to === "LOST" &&
      m.reason === REASON &&
      m.survivorLeadId === target.survivorLeadId &&
      m.marketingLeadId === target.marketingLeadId
    );
  });
  if (!evidence) {
    throw new Error(
      `POSTCHECK_FAIL: missing opportunity.stage_updated evidence for ${target.opportunityId}`,
    );
  }

  console.log(
    JSON.stringify({
      status: "applied",
      opportunityId: target.opportunityId,
      activityId: evidence.id,
      survivorLeadId: target.survivorLeadId,
      marketingLeadId: target.marketingLeadId,
    }),
  );
}

async function main() {
  const execute = process.env.CRM_CONSULT_DUP_RECONCILE_EXECUTE === "1";
  const mode = execute ? "EXECUTE" : "DRY_RUN";
  console.log(JSON.stringify({ script: "crm-consult-duplicate-reconciliation-v1", mode }));

  const plan: VerifyOk[] = [];
  for (const target of TARGETS) {
    const result = await verifyTarget(target);
    plan.push(result);
    console.log(JSON.stringify({ verify: result }));
  }

  if (!execute) {
    console.log(
      JSON.stringify({
        done: true,
        mode,
        hint: "Set CRM_CONSULT_DUP_RECONCILE_EXECUTE=1 to apply INIT→LOST",
        wouldApply: plan.filter((p) => p.action === "apply").map((p) => p.opportunityId),
        wouldSkip: plan.filter((p) => p.action === "skip").map((p) => p.opportunityId),
      }),
    );
    return;
  }

  for (const target of TARGETS) {
    await applyTarget(target);
  }

  console.log(JSON.stringify({ done: true, mode }));
}

main()
  .catch((err) => {
    console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
