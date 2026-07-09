/**
 * V84 — Customer success follow-up & retention verification
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
import { type SlaThresholds } from "../lib/pilot/v82";
import { buildDeliveryIntelligenceDashboard as buildIntel } from "../lib/pilot/v83";
import {
  assignFollowUpOwner,
  buildCrmDashboard,
  buildSessionFollowUpDetail,
  clearCustomerSuccessStoreForTests,
  escalateHotAccount,
  listRetentionActions,
  markFollowUpResolved,
  recordContactAttempt,
  V84_CUSTOMER_SUCCESS_VERSION,
} from "../lib/pilot/v84";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v84";
const ACTOR = "cs-user";

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
  console.log("V84 — Customer Success Follow-up & Retention\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearCustomerSuccessStoreForTests();

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
    productionProjectId: "proj-v84",
    productionQuoteId: "quote-v84",
    productionTenderId: "tender-v84",
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

  const intel = buildIntel(ORG, { thresholds: TEST_THRESHOLDS });
  assert(intel.rankedSessions.length >= 1, "intelligence ready");
  console.log("✓ intelligence input");

  const crmBefore = buildCrmDashboard(ORG);
  assert(crmBefore.version === V84_CUSTOMER_SUCCESS_VERSION, "crm version");
  assert(crmBefore.customers.length === 1, "customer list");
  assert(crmBefore.customers[0]!.riskScore > 0, "risk score from v83");
  assert(crmBefore.queue.length === 1, "follow-up queue");
  console.log("✓ CRM dashboard read");

  const assigned = assignFollowUpOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "CS Rep",
  });
  assert(assigned.ownerId === ACTOR, "owner assigned");
  assert(assigned.status === "in_progress", "in progress");
  console.log("✓ assign owner");

  recordContactAttempt({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "首次外呼",
    responseStatus: "no_response",
  });
  assert(listRetentionActions(session.id).some((a) => a.action === "contact_attempt"), "contact logged");
  console.log("✓ contact attempt");

  escalateHotAccount({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    reason: "高风险",
  });
  const crmEscalated = buildCrmDashboard(ORG);
  assert(crmEscalated.summary.escalated >= 1, "escalated in summary");
  console.log("✓ escalate hot account");

  markFollowUpResolved({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "客户已确认收到",
  });
  const crmResolved = buildCrmDashboard(ORG);
  assert(crmResolved.summary.resolved >= 1, "resolved");
  assert(crmResolved.queue.length === 0, "queue cleared after resolve");
  console.log("✓ mark resolved");

  const detail = buildSessionFollowUpDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 4, "action history");
  assert(detail.customer.followUp.status === "resolved", "detail resolved");
  console.log("✓ action timeline");

  console.log("\nPASS — V84 customer success (in-memory)");
  console.log("  E2E: intelligence → assign → follow-up → resolve → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
