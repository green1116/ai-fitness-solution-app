/**
 * V85 — Account health & renewal forecasting verification
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
import {
  assignFollowUpOwner,
  clearCustomerSuccessStoreForTests,
  markFollowUpResolved,
} from "../lib/pilot/v84";
import {
  buildAccountHealthDashboard,
  buildAccountHealthDetail,
  buildRenewalForecast,
  clearForecastCacheForTests,
  computeAccountHealthScores,
  computeEngagementScore,
  daysUntilRenewal,
  getCachedForecast,
  V85_ACCOUNT_HEALTH_VERSION,
} from "../lib/pilot/v85";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v85";
const ACTOR = "health-user";

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
  console.log("V85 — Account Health & Renewal Forecasting\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearCustomerSuccessStoreForTests();
  clearForecastCacheForTests();

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
    productionProjectId: "proj-v85",
    productionQuoteId: "quote-v85",
    productionTenderId: "tender-v85",
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
    type: "delivery_opened",
  });
  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "artifact_downloaded",
  });

  assignFollowUpOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "CS",
  });
  markFollowUpResolved({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
  });

  console.log("✓ follow-up resolved");

  const events = [
    {
      id: "1",
      sessionId: session.id,
      organizationId: ORG,
      type: "release_ready" as const,
      timestamp: signedOffAt,
    },
    {
      id: "2",
      sessionId: session.id,
      organizationId: ORG,
      type: "delivery_opened" as const,
      timestamp: new Date().toISOString(),
    },
    {
      id: "3",
      sessionId: session.id,
      organizationId: ORG,
      type: "artifact_downloaded" as const,
      timestamp: new Date().toISOString(),
    },
  ];

  const engagement = computeEngagementScore(events);
  assert(engagement > 30, "engagement score");
  console.log("✓ engagement score");

  const followUp = {
    sessionId: session.id,
    organizationId: ORG,
    status: "resolved" as const,
    responseStatus: "responded" as const,
    resolutionStatus: "resolved" as const,
    contactAttempts: 2,
    createdAt: signedOffAt,
    updatedAt: new Date().toISOString(),
  };

  const scores = computeAccountHealthScores({
    sessionId: session.id,
    signedOffAt,
    riskScore: 20,
    events,
    followUp,
  });
  assert(scores.accountHealthScore > 0, "health score");
  assert(scores.renewalLikelihood > 0, "renewal likelihood");
  assert(scores.readOnly === true, "read only scores");
  console.log("✓ health scoring");

  const days = daysUntilRenewal(signedOffAt);
  assert(days <= 30, "expiring soon window");
  console.log("✓ renewal window");

  const forecast = buildRenewalForecast(
    {
      sessionId: session.id,
      organizationId: ORG,
      signedOffAt,
      riskScore: 20,
      events,
      followUp,
    },
    { useCache: true },
  );
  assert(Boolean(getCachedForecast(ORG, session.id)), "forecast cache");
  assert(forecast.readOnly === true, "read only forecast");
  console.log("✓ renewal forecast + cache");

  const dashboard = buildAccountHealthDashboard(ORG);
  assert(dashboard.version === V85_ACCOUNT_HEALTH_VERSION, "version");
  assert(dashboard.accounts.length === 1, "accounts");
  assert(dashboard.renewalList.length === 1, "renewal list");
  assert(dashboard.readOnly === true, "read only dashboard");
  assert(dashboard.summary.avgHealthScore > 0, "summary");
  console.log("✓ account dashboard");

  const detail = buildAccountHealthDetail(session.id, ORG);
  assert(detail.forecastTimeline.length >= 2, "forecast timeline");
  assert(detail.account.deliveryHistory.length >= 1, "delivery history");
  console.log("✓ account drilldown");

  console.log("\nPASS — V85 account health (in-memory)");
  console.log("  E2E: follow-up → score → forecast → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
