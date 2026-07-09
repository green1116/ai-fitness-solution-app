/**
 * V82 — Delivery analytics & SLA monitoring verification
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
  aggregateDeliveryAnalytics,
  buildDeliveryMonitoringDashboard,
  buildSessionMonitoringTimeline,
  evaluateSessionAlerts,
  evaluateSessionSla,
  V82_DELIVERY_ANALYTICS_VERSION,
  type SlaThresholds,
} from "../lib/pilot/v82";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v82";
const ACTOR = "analytics-user";

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
  console.log("V82 — Delivery Analytics & SLA Monitoring\n");
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

  const signedOffAt = new Date(Date.now() - 90_000).toISOString();

  updateIntakeSession(session.id, {
    extractedRequirements: extracted,
    requirements: extracted,
    status: "ready",
    workflowStatus: "completed",
    productionProjectId: "proj-v82",
    productionQuoteId: "quote-v82",
    productionTenderId: "tender-v82",
    qaPassedAt: signedOffAt,
    deliveryLocked: true,
  });

  seedAudit(session.id);
  freezeIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });

  await signOffIntakeSession({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });
  updateIntakeSession(
    session.id,
    { signedOffAt },
    { bypassFreeze: true },
  );

  seedReleaseReadyTracking({ sessionId: session.id, organizationId: ORG, actorId: ACTOR });

  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "delivery_opened",
  });

  console.log("✓ release + track");

  const kpis = aggregateDeliveryAnalytics(ORG);
  assert(kpis.releasedCount === 1, "released count");
  assert(kpis.openedCount === 1, "opened count");
  assert(kpis.readOnly === true, "read only kpis");
  console.log("✓ analytics aggregate");

  const now = new Date();
  const events = [
    {
      id: "e1",
      sessionId: session.id,
      organizationId: ORG,
      type: "release_ready" as const,
      timestamp: signedOffAt,
    },
    {
      id: "e2",
      sessionId: session.id,
      organizationId: ORG,
      type: "delivery_opened" as const,
      timestamp: new Date(Date.now() - 45_000).toISOString(),
    },
  ];

  const sla = evaluateSessionSla(
    {
      sessionId: session.id,
      signedOffAt,
      events,
    },
    { now, thresholds: TEST_THRESHOLDS },
  );
  assert(sla.releaseToFirstOpen === "met", "open SLA met");
  assert(sla.readOnly === true, "read only sla");
  console.log("✓ SLA evaluation");

  const alertsNoOpen = evaluateSessionAlerts(
    {
      sessionId: "other",
      organizationId: ORG,
      signedOffAt: new Date(Date.now() - 120_000).toISOString(),
      events: [{ id: "r", sessionId: "other", organizationId: ORG, type: "release_ready", timestamp: new Date(Date.now() - 120_000).toISOString() }],
    },
    { now, thresholds: TEST_THRESHOLDS },
  );
  assert(alertsNoOpen.some((a) => a.kind === "no_open_after_release"), "no open alert");
  console.log("✓ alert rules");

  recordDeliveryTrackingEvent({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    type: "delivery_failed",
    meta: { message: "zip timeout" },
  });

  const dashboard = buildDeliveryMonitoringDashboard(ORG, {
    now,
    thresholds: TEST_THRESHOLDS,
  });
  assert(dashboard.version === V82_DELIVERY_ANALYTICS_VERSION, "version");
  assert(dashboard.readOnly === true, "read only dashboard");
  assert(dashboard.kpis.failedDeliveryCount === 1, "failed in kpis");
  assert(dashboard.alerts.length >= 1, "alerts populated");
  console.log("✓ monitoring dashboard");

  const timeline = buildSessionMonitoringTimeline(session.id, ORG, {
    now,
    thresholds: TEST_THRESHOLDS,
  });
  assert(timeline.entries.length >= 2, "timeline entries");
  assert(timeline.readOnly === true, "read only timeline");
  console.log("✓ per-session timeline");

  console.log("\nPASS — V82 delivery analytics (in-memory)");
  console.log("  E2E: release → track → aggregate → alert → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
