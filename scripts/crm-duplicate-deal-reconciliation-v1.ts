/**
 * CRM Duplicate Deal Reconciliation — one-time.
 *
 * Target: cmszg2mvw0001hhscfomro439 → closeDealLost
 * Survivor: deal cmszg2odd0005hhsco19a6wco / opp cmsyhbih8003chhtoisdkij1d
 *
 * Default: dry-run. Set CRM_DUP_DEAL_RECONCILE_EXECUTE=1 to apply.
 * Does NOT delete. No schema/migration.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { closeDealLost } from "../lib/crm/deal/deal.service";

const REASON = "duplicate_consult_reconciliation" as const;

const TARGET = {
  dealId: "cmszg2mvw0001hhscfomro439",
  opportunityId: "cmsyhqtdr0002hh54heyq4v0z",
  customerId: "cmsyaj3uq001rhhto94l3r1ue",
  leadId: "cmsyaj4io001vhhtofhl9r98w",
  marketingLeadId: "cmsyaj21v001phhto3qubxafu",
  survivorDealId: "cmszg2odd0005hhsco19a6wco",
  survivorOpportunityId: "cmsyhbih8003chhtoisdkij1d",
} as const;

function metaOf(row: { meta: unknown }): Record<string, unknown> {
  if (!row.meta || typeof row.meta !== "object" || Array.isArray(row.meta)) return {};
  return row.meta as Record<string, unknown>;
}

type VerifyResult =
  | { action: "skip"; reason: string }
  | { action: "apply" };

async function verify(): Promise<VerifyResult> {
  return prisma.$transaction(async (tx) => {
    const targetDeal = await tx.deal.findFirst({ where: { id: TARGET.dealId } });
    if (!targetDeal) {
      throw new Error(`FAIL_CLOSED: target deal missing ${TARGET.dealId}`);
    }

    if (String(targetDeal.status).toUpperCase() === "CLOSED_LOST") {
      return { action: "skip" as const, reason: "already_CLOSED_LOST" };
    }
    if (String(targetDeal.status).toUpperCase() !== "OPEN") {
      throw new Error(
        `FAIL_CLOSED: target deal status=${targetDeal.status} expected=OPEN`,
      );
    }
    if (Number(targetDeal.amount) !== 0) {
      throw new Error(
        `FAIL_CLOSED: target deal amount=${targetDeal.amount} expected=0`,
      );
    }
    if (targetDeal.opportunityId !== TARGET.opportunityId) {
      throw new Error(
        `FAIL_CLOSED: target deal opportunityId mismatch got=${targetDeal.opportunityId}`,
      );
    }

    const targetOpp = await tx.opportunity.findFirst({
      where: { id: TARGET.opportunityId },
    });
    if (!targetOpp) {
      throw new Error(`FAIL_CLOSED: target opportunity missing ${TARGET.opportunityId}`);
    }
    if (String(targetOpp.stage).toUpperCase() !== "NEGOTIATION") {
      throw new Error(
        `FAIL_CLOSED: target opp stage=${targetOpp.stage} expected=NEGOTIATION`,
      );
    }
    if (Number(targetOpp.value) !== 0) {
      throw new Error(
        `FAIL_CLOSED: target opp value=${targetOpp.value} expected=0`,
      );
    }
    if (targetOpp.customerId !== TARGET.customerId) {
      throw new Error(
        `FAIL_CLOSED: target opp customerId mismatch got=${targetOpp.customerId}`,
      );
    }
    if (targetOpp.leadId !== TARGET.leadId) {
      throw new Error(
        `FAIL_CLOSED: target opp leadId mismatch got=${targetOpp.leadId}`,
      );
    }

    const survivorDeal = await tx.deal.findFirst({
      where: { id: TARGET.survivorDealId },
    });
    if (!survivorDeal) {
      throw new Error(`FAIL_CLOSED: survivor deal missing ${TARGET.survivorDealId}`);
    }
    if (String(survivorDeal.status).toUpperCase() !== "OPEN") {
      throw new Error(
        `FAIL_CLOSED: survivor deal status=${survivorDeal.status} expected=OPEN`,
      );
    }
    if (survivorDeal.opportunityId !== TARGET.survivorOpportunityId) {
      throw new Error(
        `FAIL_CLOSED: survivor deal opportunityId mismatch got=${survivorDeal.opportunityId}`,
      );
    }

    const survivorOpp = await tx.opportunity.findFirst({
      where: { id: TARGET.survivorOpportunityId },
    });
    if (!survivorOpp) {
      throw new Error(
        `FAIL_CLOSED: survivor opportunity missing ${TARGET.survivorOpportunityId}`,
      );
    }
    if (survivorOpp.customerId !== TARGET.customerId) {
      throw new Error("FAIL_CLOSED: survivor/target customerId mismatch");
    }
    if (survivorOpp.leadId !== TARGET.leadId) {
      throw new Error("FAIL_CLOSED: survivor/target leadId mismatch");
    }

    const leadCreated = await tx.cRMActivity.findMany({
      where: { customerId: TARGET.customerId, type: "lead.created" },
      take: 200,
    });
    const marketingOk = leadCreated.some((a) => {
      const m = metaOf(a);
      return m.leadId === TARGET.leadId && m.marketingLeadId === TARGET.marketingLeadId;
    });
    if (!marketingOk) {
      throw new Error(
        `FAIL_CLOSED: marketingLeadId not verified for lead=${TARGET.leadId}`,
      );
    }

    return { action: "apply" as const };
  });
}

async function apply(): Promise<void> {
  const verified = await verify();
  if (verified.action === "skip") {
    console.log(JSON.stringify({ status: "skipped", ...verified, dealId: TARGET.dealId }));
    return;
  }

  await closeDealLost({
    dealId: TARGET.dealId,
    reason: REASON,
    survivorDealId: TARGET.survivorDealId,
    survivorOpportunityId: TARGET.survivorOpportunityId,
    marketingLeadId: TARGET.marketingLeadId,
  });

  const afterDeal = await prisma.deal.findFirst({ where: { id: TARGET.dealId } });
  if (!afterDeal || String(afterDeal.status).toUpperCase() !== "CLOSED_LOST") {
    throw new Error(`POSTCHECK_FAIL: deal not CLOSED_LOST ${TARGET.dealId}`);
  }

  const afterOpp = await prisma.opportunity.findFirst({
    where: { id: TARGET.opportunityId },
  });
  if (!afterOpp || String(afterOpp.stage).toUpperCase() !== "LOST") {
    throw new Error(`POSTCHECK_FAIL: opportunity not LOST ${TARGET.opportunityId}`);
  }

  const survivorDeal = await prisma.deal.findFirst({
    where: { id: TARGET.survivorDealId },
  });
  if (!survivorDeal || String(survivorDeal.status).toUpperCase() !== "OPEN") {
    throw new Error(`POSTCHECK_FAIL: survivor deal no longer OPEN`);
  }

  const activities = await prisma.cRMActivity.findMany({
    where: { customerId: TARGET.customerId },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
  const closedLost = activities.find((a) => {
    const m = metaOf(a);
    return (
      a.type === "deal.closed_lost" &&
      m.dealId === TARGET.dealId &&
      m.reason === REASON &&
      m.survivorDealId === TARGET.survivorDealId &&
      m.survivorOpportunityId === TARGET.survivorOpportunityId &&
      m.marketingLeadId === TARGET.marketingLeadId
    );
  });
  const stageUpdated = activities.find((a) => {
    const m = metaOf(a);
    return (
      a.type === "opportunity.stage_updated" &&
      m.opportunityId === TARGET.opportunityId &&
      m.to === "LOST" &&
      m.reason === REASON
    );
  });
  if (!closedLost) {
    throw new Error("POSTCHECK_FAIL: missing deal.closed_lost evidence");
  }
  if (!stageUpdated) {
    throw new Error("POSTCHECK_FAIL: missing opportunity.stage_updated evidence");
  }

  console.log(
    JSON.stringify({
      status: "applied",
      dealId: TARGET.dealId,
      opportunityId: TARGET.opportunityId,
      dealClosedLostActivityId: closedLost.id,
      opportunityStageUpdatedActivityId: stageUpdated.id,
      survivorDealId: TARGET.survivorDealId,
      survivorOpportunityId: TARGET.survivorOpportunityId,
    }),
  );
}

async function main() {
  const execute = process.env.CRM_DUP_DEAL_RECONCILE_EXECUTE === "1";
  const mode = execute ? "EXECUTE" : "DRY_RUN";
  console.log(JSON.stringify({ script: "crm-duplicate-deal-reconciliation-v1", mode }));

  const result = await verify();
  console.log(JSON.stringify({ verify: result, target: TARGET }));

  if (!execute) {
    console.log(
      JSON.stringify({
        done: true,
        mode,
        hint: "Set CRM_DUP_DEAL_RECONCILE_EXECUTE=1 to apply closeDealLost",
      }),
    );
    return;
  }

  await apply();
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
