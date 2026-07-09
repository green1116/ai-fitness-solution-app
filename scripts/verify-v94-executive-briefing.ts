/**
 * V94 — Executive briefing & decision support verification
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
import {
  buildExecutiveSummary,
  clearReportCacheForTests,
  generateBoardPacket,
} from "../lib/pilot/v93";
import {
  buildBriefingContent,
  buildDecisionSupportList,
  buildExecutiveBriefingDashboard,
  clearBriefingCacheForTests,
  generateBriefingPack,
  listBriefingActions,
  markDecisionActed,
  recordBriefingAction,
  V94_EXECUTIVE_BRIEFING_VERSION,
} from "../lib/pilot/v94";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v94";
const ACTOR = "executive-briefing";

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
  console.log("V94 — Executive Briefing & Decision Support\n");
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
    productionProjectId: "proj-v94",
    productionQuoteId: "quote-v94",
    productionTenderId: "tender-v94",
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

  console.log("✓ governance ready");

  const reportSummary = buildExecutiveSummary(ORG);
  assert(reportSummary.portfolio.totalAccounts >= 1, "report summary");
  const packet = generateBoardPacket({
    organizationId: ORG,
    actorId: ACTOR,
    title: "Q2 Board Packet",
  });
  assert(packet.id.length > 0, "board packet");
  console.log("✓ report → board packet");

  const briefing = buildBriefingContent(ORG);
  assert(briefing.narrative.length > 0, "executive narrative");
  assert(briefing.pendingDecisions.length >= 0, "pending decisions");
  console.log("✓ brief content");

  const support = buildDecisionSupportList(ORG);
  assert(support.length >= 1, "decision support");
  assert(support[0].recommendedAction.length > 0, "recommended action");
  assert(support[0].dueDate.length > 0, "due date");
  console.log("✓ decision support");

  const pack = generateBriefingPack({
    organizationId: ORG,
    actorId: ACTOR,
    title: "Weekly Executive Brief",
  });
  assert(pack.decisionSupport.length >= 1, "pack decisions");
  assert(pack.drilldownLinks.length >= 0, "drilldown links");
  assert(pack.decisionLog.length >= 0, "decision log");
  console.log("✓ generate briefing pack");

  const targetSession = support[0].sessionId;

  recordBriefingAction({
    organizationId: ORG,
    actorId: ACTOR,
    briefingId: pack.id,
    sessionId: targetSession,
    note: "高管已审议",
  });

  markDecisionActed({
    organizationId: ORG,
    actorId: ACTOR,
    briefingId: pack.id,
    sessionId: targetSession,
    note: "行动已执行",
  });
  console.log("✓ decide → act");

  const dashboard = buildExecutiveBriefingDashboard(ORG);
  assert(dashboard.version === V94_EXECUTIVE_BRIEFING_VERSION, "version");
  assert(dashboard.packs.length >= 1, "pack list");
  assert(dashboard.briefing.readOnly === true, "read only briefing");
  assert(listBriefingActions(ORG).length >= 3, "action timeline");
  console.log("✓ briefing dashboard");

  console.log("\nPASS — V94 executive briefing (in-memory)");
  console.log("  E2E: report → brief → decide → act → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
