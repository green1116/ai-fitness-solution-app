/**
 * V88 — Growth planning & forecast verification
 */
import {
  appendIntakeAudit,
  clearIntakeStoreForTests,
  createIntakeSession,
  extractRequirementsFromParsedTender,
  freezeIntakeSession,
  runTenderParserPipeline,
  signOffIntakeSession,
  updateIntakeSession,
} from "../lib/pilot/v80";
import {
  clearDeliveryOpsStoreForTests,
  recordDeliveryTrackingEvent,
  seedReleaseReadyTracking,
} from "../lib/pilot/v81";
import { clearForecastCacheForTests } from "../lib/pilot/v85";
import { clearRenewalOpsStoreForTests } from "../lib/pilot/v86";
import { clearRevenueOpsStoreForTests } from "../lib/pilot/v87";
import {
  assignGrowthOwner,
  buildGrowthPlanningDashboard,
  buildGrowthPlanningDetail,
  buildGrowthPlanningPipeline,
  classifyPlanningQueue,
  clearGrowthOpsStoreForTests,
  listGrowthOpsActions,
  logGrowthOutcome,
  markGrowthRetained,
  scheduleExpansionFollowUp,
  V88_GROWTH_PLANNING_VERSION,
} from "../lib/pilot/v88";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v88";
const ACTOR = "growth-planning";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function seedAudit(sessionId: string) {
  const base = { sessionId, organizationId: ORG, actorId: ACTOR };
  appendIntakeAudit({ ...base, step: "upload" });
  appendIntakeAudit({ ...base, step: "extract" });
  appendIntakeAudit({ ...base, step: "validate", meta: { valid: true } });
  appendIntakeAudit({ ...base, step: "approve" });
  appendIntakeAudit({ ...base, step: "generate", workflowStatusAfter: "completed" });
  appendIntakeAudit({ ...base, step: "qa", meta: { handoffReady: true } });
  appendIntakeAudit({ ...base, step: "handoff" });
}

async function main() {
  console.log("V88 — Growth Planning & Forecast\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();

  const parsed = await runTenderParserPipeline({ rawText: SAMPLE, fileName: "t.pdf" });
  const extracted = extractRequirementsFromParsedTender({
    parseResult: parsed,
    sourceName: "t.pdf",
  });

  const session = createIntakeSession({
    organizationId: ORG,
    userId: ACTOR,
    fileName: "t.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  const signedOffAt = new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString();

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-v88",
    productionQuoteId: "quote-v88",
    productionTenderId: "tender-v88",
    qaPassedAt: signedOffAt,
    deliveryLocked: true,
  });

  seedAudit(session.id);
  freezeIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  await signOffIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  updateIntakeSession(session.id, { signedOffAt }, { bypassFreeze: true });

  seedReleaseReadyTracking({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "delivery_failed",
  });

  console.log("✓ revenue forecast ready");

  const { buildAccountHealthDashboard } = await import("../lib/pilot/v85");
  const { buildRevenueOpsDashboard } = await import("../lib/pilot/v87");
  const health = buildAccountHealthDashboard(ORG);
  const revenue = buildRevenueOpsDashboard(ORG);
  const account = health.accounts.find((a) => a.sessionId === session.id);
  assert(Boolean(account), "account row");
  const revenueItem = revenue.allItems.find((i) => i.sessionId === session.id) ?? null;

  const queue = classifyPlanningQueue({
    account: account!,
    revenueItem,
    growthOutcome: "open",
    baseRenewalValue: revenueItem?.expectedRenewalValue ?? 50_000,
  });
  assert(queue !== null, "classify planning queue");
  console.log(`✓ forecast → plan (${queue})`);

  const pipeline = buildGrowthPlanningPipeline(ORG);
  assert(pipeline.allItems.length >= 1, "planning pipeline");
  console.log("✓ planning queues");

  const dashboard = buildGrowthPlanningDashboard(ORG);
  assert(dashboard.version === V88_GROWTH_PLANNING_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  assert(dashboard.forecast.predictedRenewalRevenue >= 0, "growth forecast");
  console.log("✓ growth dashboard + forecast cards");

  assignGrowthOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Growth Rep",
  });
  console.log("✓ assign growth owner");

  scheduleExpansionFollowUp({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    scheduledAt: new Date(Date.now() + 172800000).toISOString(),
    note: "扩展机会跟进",
  });
  console.log("✓ schedule expansion follow-up");

  logGrowthOutcome({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "初步增长评估完成",
  });
  assert(listGrowthOpsActions(session.id).length >= 3, "action log");
  console.log("✓ log outcome");

  markGrowthRetained({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "客户留存确认",
  });

  const afterRetain = buildGrowthPlanningDashboard(ORG);
  assert(afterRetain.summary.retained >= 1, "retained outcome");
  console.log("✓ mark retained");

  const detail = buildGrowthPlanningDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 4, "action timeline");
  console.log("✓ drilldown timeline");

  console.log("\nPASS — V88 growth planning (in-memory)");
  console.log("  E2E: revenue → forecast → plan → act → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
