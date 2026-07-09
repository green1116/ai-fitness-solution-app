/**
 * V86 — Renewal ops & churn prevention verification
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
import {
  assignRenewalOwner,
  buildRenewalOpsDashboard,
  buildRenewalOpsDetail,
  buildRenewalPipeline,
  clearRenewalOpsStoreForTests,
  listRenewalOpsActions,
  markRenewalChurned,
  markRenewalSaved,
  recordRenewalAttempt,
  V86_RENEWAL_OPS_VERSION,
} from "../lib/pilot/v86";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v86";
const ACTOR = "renewal-ops";

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
  console.log("V86 — Renewal Ops & Churn Prevention\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();

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
    productionProjectId: "proj-v86",
    productionQuoteId: "quote-v86",
    productionTenderId: "tender-v86",
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

  console.log("✓ forecast data ready");

  const pipeline = buildRenewalPipeline(ORG);
  assert(
    pipeline.expiringSoon.length >= 1 ||
      pipeline.atRisk.length >= 1 ||
      pipeline.outreachNeeded.length >= 1,
    "pipeline queues",
  );
  console.log("✓ renewal pipeline queues");

  const dashboard = buildRenewalOpsDashboard(ORG);
  assert(dashboard.version === V86_RENEWAL_OPS_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  console.log("✓ renewal ops dashboard");

  assignRenewalOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Renewal Rep",
  });
  console.log("✓ assign owner");

  recordRenewalAttempt({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "首次续约外联",
  });
  assert(listRenewalOpsActions(session.id).some((a) => a.action === "renewal_attempt"), "attempt");
  console.log("✓ renewal attempt");

  markRenewalSaved({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "客户同意续签",
  });

  const afterSave = buildRenewalOpsDashboard(ORG);
  assert(afterSave.summary.saved >= 1, "saved outcome");
  assert(
    afterSave.queues.expiringSoon.every((i) => i.sessionId !== session.id) &&
      afterSave.queues.atRisk.every((i) => i.sessionId !== session.id),
    "removed from active queues",
  );
  console.log("✓ mark saved");

  markRenewalChurned({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    reason: "test churn rollback",
  });

  const detail = buildRenewalOpsDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 3, "action history");
  console.log("✓ action timeline");

  console.log("\nPASS — V86 renewal ops (in-memory)");
  console.log("  E2E: forecast → queue → assign → outreach → saved/churned → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
