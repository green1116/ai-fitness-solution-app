/**
 * CRM Consult Duplicate Opportunity Reconciliation v2 — one-time.
 *
 * Scope: 3 INIT duplicate Opportunities (same customer/lead/marketingLeadId)
 * Action: updateOpportunityStage INIT → LOST with reconciliation meta.
 *
 * Default: dry-run. Set CRM_CONSULT_DUP_OPP_RECONCILE_EXECUTE=1 to apply.
 * Does NOT delete. Does NOT modify survivor Opportunity cmsyhbih8003chhtoisdkij1d.
 * No schema / migration.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { updateOpportunityStage } from "../lib/crm/opportunity/opportunity.service";

const REASON = "duplicate_consult_reconciliation" as const;

const SHARED = {
  customerId: "cmsyaj3uq001rhhto94l3r1ue",
  leadId: "cmsyaj4io001vhhtofhl9r98w",
  survivorLeadId: "cmsyaj4io001vhhtofhl9r98w",
  marketingLeadId: "cmsyaj21v001phhto3qubxafu",
  survivorOpportunityId: "cmsyhbih8003chhtoisdkij1d",
} as const;

const TARGET_OPP_IDS = [
  "cmsyfavbt002rhhtok8bf840o",
  "cmsyg36vi002yhhtox8v3e24y",
  "cmsygcsoo0035hhtoeu9yok9y",
] as const;

function metaOf(row: { meta: unknown }): Record<string, unknown> {
  if (!row.meta || typeof row.meta !== "object" || Array.isArray(row.meta)) return {};
  return row.meta as Record<string, unknown>;
}

type VerifyResult =
  | { action: "skip"; opportunityId: string; reason: string }
  | { action: "apply"; opportunityId: string };

async function verifyOne(opportunityId: string): Promise<VerifyResult> {
  return prisma.$transaction(async (tx) => {
    if (opportunityId === SHARED.survivorOpportunityId) {
      throw new Error(`FAIL_CLOSED: refusing to touch survivor opp ${opportunityId}`);
    }

    const opportunity = await tx.opportunity.findFirst({ where: { id: opportunityId } });
    if (!opportunity) {
      throw new Error(`FAIL_CLOSED: opportunity missing ${opportunityId}`);
    }

    if (opportunity.customerId !== SHARED.customerId) {
      throw new Error(
        `FAIL_CLOSED: customerId mismatch opp=${opportunityId} got=${opportunity.customerId}`,
      );
    }
    if (opportunity.leadId !== SHARED.leadId) {
      throw new Error(
        `FAIL_CLOSED: leadId mismatch opp=${opportunityId} got=${opportunity.leadId}`,
      );
    }

    const stage = String(opportunity.stage).toUpperCase();
    if (stage === "LOST") {
      return { action: "skip" as const, opportunityId, reason: "already_LOST" };
    }
    if (stage !== "INIT") {
      throw new Error(
        `FAIL_CLOSED: stage not INIT (got ${opportunity.stage}) opp=${opportunityId}`,
      );
    }
    if (Number(opportunity.value) !== 0) {
      throw new Error(
        `FAIL_CLOSED: value=${opportunity.value} expected=0 opp=${opportunityId}`,
      );
    }

    const dealCount = await tx.deal.count({ where: { opportunityId } });
    if (dealCount !== 0) {
      throw new Error(
        `FAIL_CLOSED: deal count=${dealCount} expected=0 opp=${opportunityId}`,
      );
    }

    const leadCreated = await tx.cRMActivity.findMany({
      where: { customerId: SHARED.customerId, type: "lead.created" },
      take: 200,
    });
    const marketingOk = leadCreated.some((a) => {
      const m = metaOf(a);
      return (
        m.leadId === SHARED.leadId && m.marketingLeadId === SHARED.marketingLeadId
      );
    });
    if (!marketingOk) {
      throw new Error(
        `FAIL_CLOSED: marketingLeadId not verified for lead=${SHARED.leadId}`,
      );
    }

    const survivor = await tx.opportunity.findFirst({
      where: { id: SHARED.survivorOpportunityId },
    });
    if (!survivor) {
      throw new Error(
        `FAIL_CLOSED: survivor opportunity missing ${SHARED.survivorOpportunityId}`,
      );
    }
    if (survivor.customerId !== SHARED.customerId || survivor.leadId !== SHARED.leadId) {
      throw new Error("FAIL_CLOSED: survivor customer/lead mismatch");
    }

    return { action: "apply" as const, opportunityId };
  });
}

async function applyOne(opportunityId: string): Promise<void> {
  const verified = await verifyOne(opportunityId);
  if (verified.action === "skip") {
    console.log(JSON.stringify({ status: "skipped", ...verified }));
    return;
  }

  await updateOpportunityStage({
    opportunityId,
    stage: "LOST",
    reason: REASON,
    survivorLeadId: SHARED.survivorLeadId,
    marketingLeadId: SHARED.marketingLeadId,
  });

  const after = await prisma.opportunity.findFirst({ where: { id: opportunityId } });
  if (!after || String(after.stage).toUpperCase() !== "LOST") {
    throw new Error(`POSTCHECK_FAIL: stage not LOST ${opportunityId}`);
  }
  if (after.customerId !== SHARED.customerId || after.leadId !== SHARED.leadId) {
    throw new Error(`POSTCHECK_FAIL: customerId/leadId mutated ${opportunityId}`);
  }

  const activities = await prisma.cRMActivity.findMany({
    where: { customerId: SHARED.customerId, type: "opportunity.stage_updated" },
    orderBy: { timestamp: "desc" },
    take: 50,
  });
  const evidence = activities.find((a) => {
    const m = metaOf(a);
    return (
      m.opportunityId === opportunityId &&
      m.to === "LOST" &&
      m.reason === REASON &&
      m.survivorLeadId === SHARED.survivorLeadId &&
      m.marketingLeadId === SHARED.marketingLeadId
    );
  });
  if (!evidence) {
    throw new Error(`POSTCHECK_FAIL: missing stage_updated evidence for ${opportunityId}`);
  }

  console.log(
    JSON.stringify({
      status: "applied",
      opportunityId,
      activityId: evidence.id,
      survivorLeadId: SHARED.survivorLeadId,
      marketingLeadId: SHARED.marketingLeadId,
    }),
  );
}

async function main() {
  const execute = process.env.CRM_CONSULT_DUP_OPP_RECONCILE_EXECUTE === "1";
  const mode = execute ? "EXECUTE" : "DRY_RUN";
  console.log(
    JSON.stringify({
      script: "crm-consult-duplicate-opportunity-reconciliation-v2",
      mode,
      survivorOpportunityId: SHARED.survivorOpportunityId,
    }),
  );

  const plan: VerifyResult[] = [];
  for (const opportunityId of TARGET_OPP_IDS) {
    const result = await verifyOne(opportunityId);
    plan.push(result);
    console.log(JSON.stringify({ verify: result }));
  }

  if (!execute) {
    console.log(
      JSON.stringify({
        done: true,
        mode,
        hint: "Set CRM_CONSULT_DUP_OPP_RECONCILE_EXECUTE=1 to apply INIT→LOST",
        wouldApply: plan.filter((p) => p.action === "apply").map((p) => p.opportunityId),
        wouldSkip: plan.filter((p) => p.action === "skip").map((p) => p.opportunityId),
      }),
    );
    return;
  }

  for (const opportunityId of TARGET_OPP_IDS) {
    await applyOne(opportunityId);
  }

  const survivorAfter = await prisma.opportunity.findFirst({
    where: { id: SHARED.survivorOpportunityId },
  });
  if (!survivorAfter || String(survivorAfter.stage).toUpperCase() === "LOST") {
    throw new Error("POSTCHECK_FAIL: survivor opportunity unexpectedly LOST/missing");
  }

  console.log(
    JSON.stringify({
      done: true,
      mode,
      survivorOpportunityId: SHARED.survivorOpportunityId,
      survivorStage: survivorAfter.stage,
    }),
  );
}

main()
  .catch((err) => {
    console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
