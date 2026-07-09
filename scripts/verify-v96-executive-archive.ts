/**
 * V96 — Executive archive & audit retrieval verification
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
import { clearGrowthOpsStoreForTests } from "../lib/pilot/v88";
import { clearExpansionOpsStoreForTests } from "../lib/pilot/v89";
import { clearPortfolioCacheForTests } from "../lib/pilot/v90";
import { clearPortfolioOpsStoreForTests } from "../lib/pilot/v91";
import { clearGovernanceStoreForTests } from "../lib/pilot/v92";
import {
  assignExecutiveOwner,
  recordGovernanceDecision,
} from "../lib/pilot/v92";
import { clearReportCacheForTests, generateBoardPacket } from "../lib/pilot/v93";
import {
  clearBriefingCacheForTests,
  generateBriefingPack,
  recordBriefingAction,
} from "../lib/pilot/v94";
import {
  assignExecutiveActionOwner,
  clearExecutiveActionStoreForTests,
  confirmExecutiveDecision,
  markExecutiveActionActed,
  markExecutiveActionClosed,
} from "../lib/pilot/v95";
import {
  archiveRecord,
  buildArchiveQueue,
  buildExecutiveArchiveDashboard,
  clearArchiveCacheForTests,
  exportAuditBundle,
  getExportsCount,
  listArchiveActions,
  markArchiveReviewed,
  retrieveAuditTrail,
  V96_EXECUTIVE_ARCHIVE_VERSION,
} from "../lib/pilot/v96";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v96";
const ACTOR = "executive-archive";

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
  console.log("V96 — Executive Archive & Audit Retrieval\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();
  clearExpansionOpsStoreForTests();
  clearPortfolioCacheForTests();
  clearPortfolioOpsStoreForTests();
  clearGovernanceStoreForTests();
  clearReportCacheForTests();
  clearBriefingCacheForTests();
  clearExecutiveActionStoreForTests();
  clearArchiveCacheForTests();

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
    productionProjectId: "proj-v96",
    productionQuoteId: "quote-v96",
    productionTenderId: "tender-v96",
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

  assignExecutiveOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Executive",
  });
  recordGovernanceDecision({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "董事会预备决议",
  });

  generateBoardPacket({ organizationId: ORG, actorId: ACTOR, title: "Q2 Board Packet" });
  const pack = generateBriefingPack({ organizationId: ORG, actorId: ACTOR, title: "Weekly Brief" });
  recordBriefingAction({
    organizationId: ORG,
    actorId: ACTOR,
    briefingId: pack.id,
    sessionId: session.id,
    note: "高管已审议",
  });

  assignExecutiveActionOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Executive",
  });
  confirmExecutiveDecision({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "决策确认",
  });
  markExecutiveActionActed({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "行动已执行",
  });
  markExecutiveActionClosed({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "治理闭环",
  });
  console.log("✓ close");

  const queue = buildArchiveQueue(ORG);
  assert(queue.allItems.length >= 1, "archive queue from closure");
  console.log("✓ archive queue");

  const record = archiveRecord({
    organizationId: ORG,
    actorId: ACTOR,
    sessionId: session.id,
    note: "正式归档",
  });
  assert(record.status === "archived", "archived status");
  assert(record.linkedIds.readOnly === true, "linked ids");
  console.log("✓ archive");

  const trail = retrieveAuditTrail(ORG, session.id);
  assert(trail.executiveActionHistory.length >= 3, "executive action history");
  assert(trail.briefingPackHistory.length >= 1, "briefing pack history");
  assert(trail.decisionTrail.length >= 1, "decision trail");
  assert(trail.closureTrail.length >= 2, "closure trail");
  console.log("✓ retrieve audit trail");

  const exported = exportAuditBundle({
    organizationId: ORG,
    actorId: ACTOR,
    sessionId: session.id,
    archiveRecordId: record.id,
  });
  assert(exported.format === "json", "export format");
  assert(exported.payload.trail?.readOnly === true, "export trail");
  assert(getExportsCount(ORG) >= 1, "exports count");
  console.log("✓ export audit bundle");

  markArchiveReviewed({
    organizationId: ORG,
    actorId: ACTOR,
    archiveRecordId: record.id,
    note: "归档已审阅",
  });

  const dashboard = buildExecutiveArchiveDashboard(ORG);
  assert(dashboard.version === V96_EXECUTIVE_ARCHIVE_VERSION, "version");
  assert(dashboard.summary.archived >= 1, "archived summary");
  assert(dashboard.summary.reviewed >= 1, "reviewed summary");
  assert(listArchiveActions(ORG).length >= 3, "archive timeline");
  console.log("✓ archive dashboard");

  console.log("\nPASS — V96 executive archive (in-memory)");
  console.log("  E2E: close → archive → retrieve → export → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
