/**
 * V83 — Delivery intelligence & optimization verification
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
import { buildDeliveryMonitoringDashboard, type SlaThresholds } from "../lib/pilot/v82";
import {
  buildDeliveryInsights,
  buildDeliveryIntelligenceDashboard,
  buildOrgRecommendations,
  buildRankedSessions,
  buildSessionIntelligenceDetail,
  scoreSessionPriority,
  V83_DELIVERY_INTELLIGENCE_VERSION,
} from "../lib/pilot/v83";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v83";
const ACTOR = "intel-user";

const TEST_THRESHOLDS: SlaThresholds = {
  firstOpenMs: 60_000,
  firstDownloadMs: 120_000,
  pendingActionMaxMs: 30_000,
  failedDeliveryAgingMs: 10_000,
};

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
  console.log("V83 — Delivery Intelligence & Optimization\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();

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

  const signedOffAt = new Date(Date.now() - 100_000).toISOString();

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-v83",
    productionQuoteId: "quote-v83",
    productionTenderId: "tender-v83",
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
    meta: { message: "timeout" },
  });

  console.log("✓ release + track + fail");

  const now = new Date();
  const opts = { now, thresholds: TEST_THRESHOLDS };
  const monitoring = buildDeliveryMonitoringDashboard(ORG, opts);

  const insights = buildDeliveryInsights(monitoring, opts);
  assert(insights.some((i) => i.pattern === "failed_delivery"), "failed pattern");
  assert(insights.some((i) => i.pattern === "sla_risk"), "sla risk insight");
  console.log("✓ insight engine");

  const recommendations = buildOrgRecommendations(monitoring, insights, opts);
  assert(recommendations.length >= 1, "recommendations");
  assert(
    recommendations.some((r) => r.action === "retry_delivery" || r.action === "escalate_to_admin"),
    "actionable rec",
  );
  assert(recommendations[0]!.readOnly === true, "read only rec");
  console.log("✓ recommendations");

  const ranked = buildRankedSessions(monitoring, recommendations, insights);
  assert(ranked[0]!.priority === "high" || ranked[0]!.due === "due_now", "prioritized");
  console.log("✓ prioritization");

  const sla = monitoring.sessions[0]!;
  const score = scoreSessionPriority({
    sla,
    alerts: monitoring.alerts.filter((a) => a.sessionId === session.id),
    patterns: ["failed_delivery", "sla_risk"],
    ...opts,
  });
  assert(score.score > 0, "score");
  console.log("✓ priority scoring");

  const dashboard = buildDeliveryIntelligenceDashboard(ORG, opts);
  assert(dashboard.version === V83_DELIVERY_INTELLIGENCE_VERSION, "version");
  assert(dashboard.readOnly === true, "read only dashboard");
  assert(dashboard.rankedSessions.length === 1, "ranked sessions");
  assert(dashboard.summary.highRisk >= 1 || dashboard.summary.dueNow >= 1, "summary");
  console.log("✓ action dashboard");

  const detail = buildSessionIntelligenceDetail(session.id, ORG, opts);
  assert(detail.recommendations.length >= 1, "session detail");
  assert(detail.readOnly === true, "read only detail");
  console.log("✓ session drilldown");

  console.log("\nPASS — V83 delivery intelligence (in-memory)");
  console.log("  E2E: release → track → analyze → recommend → prioritize → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
