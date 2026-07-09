/**
 * V87 — Revenue ops & forecast control verification
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
import {
  assignRevenueOwner,
  buildRevenueOpsDashboard,
  buildRevenueOpsDetail,
  buildRevenuePipeline,
  classifyRevenueQueue,
  clearRevenueOpsStoreForTests,
  escalateRevenueCase,
  listRevenueOpsActions,
  markRevenueChurned,
  markRevenueSaved,
  V87_REVENUE_OPS_VERSION,
} from "../lib/pilot/v87";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v87";
const ACTOR = "revenue-ops";

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
  console.log("V87 — Revenue Ops & Forecast Control\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();

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
    productionProjectId: "proj-v87",
    productionQuoteId: "quote-v87",
    productionTenderId: "tender-v87",
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

  console.log("✓ renewal forecast ready");

  const { buildAccountHealthDashboard } = await import("../lib/pilot/v85");
  const health = buildAccountHealthDashboard(ORG);
  const account = health.accounts.find((a) => a.sessionId === session.id);
  assert(Boolean(account), "account row");
  const queue = classifyRevenueQueue({
    account: account!,
    renewalOutcome: "open",
    revenueOutcome: "open",
  });
  assert(queue !== null, "classify revenue queue");
  console.log(`✓ classify → ${queue}`);

  const pipeline = buildRevenuePipeline(ORG);
  assert(
    pipeline.atRisk.length >= 1 ||
      pipeline.expiringSoon.length >= 1 ||
      pipeline.churnRisk.length >= 1,
    "revenue pipeline",
  );
  console.log("✓ revenue pipeline queues");

  const dashboard = buildRevenueOpsDashboard(ORG);
  assert(dashboard.version === V87_REVENUE_OPS_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  assert(dashboard.forecast.expectedRenewalValue >= 0, "forecast");
  console.log("✓ revenue dashboard + forecast");

  assignRevenueOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Revenue Rep",
  });
  console.log("✓ assign owner");

  escalateRevenueCase({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "高风险收入升级",
  });
  assert(listRevenueOpsActions(session.id).some((a) => a.action === "escalate"), "escalate");
  console.log("✓ escalate");

  markRevenueSaved({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "收入已挽留",
  });

  const afterSave = buildRevenueOpsDashboard(ORG);
  assert(afterSave.summary.saved >= 1, "saved queue");
  assert(afterSave.forecast.savedRevenue > 0, "saved revenue");
  console.log("✓ mark saved");

  markRevenueChurned({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    reason: "test churn",
  });

  const afterChurn = buildRevenueOpsDashboard(ORG);
  assert(afterChurn.summary.churned >= 1, "churned count");
  assert(afterChurn.forecast.churnedRevenue > 0, "churned revenue");

  const detail = buildRevenueOpsDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 3, "action history");
  console.log("✓ action timeline");

  console.log("\nPASS — V87 revenue ops (in-memory)");
  console.log("  E2E: renewal → classify → control → save/churn → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
