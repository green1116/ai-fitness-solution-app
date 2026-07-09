/**
 * V95 — Executive actions & governance closure verification
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
  buildExecutiveActionDashboard,
  buildExecutiveActionPipeline,
  buildGovernanceClosureView,
  clearExecutiveActionStoreForTests,
  confirmExecutiveDecision,
  listExecutiveActionsForOrg,
  markExecutiveActionActed,
  markExecutiveActionClosed,
  V95_EXECUTIVE_ACTIONS_VERSION,
} from "../lib/pilot/v95";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v95";
const ACTOR = "executive-actions";

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
  console.log("V95 — Executive Actions & Governance Closure\n");
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
    productionProjectId: "proj-v95",
    productionQuoteId: "quote-v95",
    productionTenderId: "tender-v95",
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

  const pack = generateBriefingPack({
    organizationId: ORG,
    actorId: ACTOR,
    title: "Weekly Brief",
  });
  recordBriefingAction({
    organizationId: ORG,
    actorId: ACTOR,
    briefingId: pack.id,
    sessionId: session.id,
    note: "高管已审议",
  });
  console.log("✓ brief → decide");

  const pipeline = buildExecutiveActionPipeline(ORG);
  assert(pipeline.allItems.length >= 1, "action queue");
  console.log("✓ executive action queue");

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
  console.log("✓ act");

  markExecutiveActionClosed({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "治理闭环",
  });
  console.log("✓ close");

  const closure = buildGovernanceClosureView(ORG);
  assert(closure.completedDecisions.length >= 1, "completed decisions");
  assert(closure.actionHistory.length >= 4, "action history");
  console.log("✓ governance closure view");

  const dashboard = buildExecutiveActionDashboard(ORG);
  assert(dashboard.version === V95_EXECUTIVE_ACTIONS_VERSION, "version");
  assert(dashboard.summary.completed >= 1, "closure summary");
  assert(listExecutiveActionsForOrg(ORG).length >= 4, "timeline");
  console.log("✓ executive action dashboard");

  console.log("\nPASS — V95 executive actions (in-memory)");
  console.log("  E2E: brief → decide → act → close → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
