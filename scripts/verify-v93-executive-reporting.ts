/**
 * V93 — Executive reporting & board packet verification
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
  buildExecutiveReportingDashboard,
  buildExecutiveSummary,
  clearReportCacheForTests,
  exportExecutiveSummary,
  generateBoardPacket,
  listReportActions,
  markPacketReviewed,
  V93_EXECUTIVE_REPORTING_VERSION,
} from "../lib/pilot/v93";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v93";
const ACTOR = "executive-reporting";

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
  console.log("V93 — Executive Reporting & Board Packet\n");
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
    productionProjectId: "proj-v93",
    productionQuoteId: "quote-v93",
    productionTenderId: "tender-v93",
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

  const summary = buildExecutiveSummary(ORG);
  assert(summary.portfolio.totalAccounts >= 1, "portfolio summary");
  assert(summary.value.totalExpectedValue >= 0, "value summary");
  console.log("✓ govern → report summaries");

  const packet = generateBoardPacket({
    organizationId: ORG,
    actorId: ACTOR,
    title: "Q2 Board Packet",
  });
  assert(packet.drilldownLinks.length >= 0, "drilldown links");
  assert(packet.decisionHistory.length >= 0, "decision history");
  console.log("✓ generate packet");

  markPacketReviewed({
    organizationId: ORG,
    packetId: packet.id,
    actorId: ACTOR,
    note: "董事会已审阅",
  });

  const exported = exportExecutiveSummary({
    organizationId: ORG,
    actorId: ACTOR,
    packetId: packet.id,
  });
  assert(exported.format === "json", "export format");
  assert(exported.payload.readOnly === true, "export payload");
  console.log("✓ export summary");

  const dashboard = buildExecutiveReportingDashboard(ORG);
  assert(dashboard.version === V93_EXECUTIVE_REPORTING_VERSION, "version");
  assert(dashboard.packets.length >= 1, "packet list");
  assert(listReportActions(ORG).length >= 3, "report history");
  console.log("✓ executive dashboard");

  console.log("\nPASS — V93 executive reporting (in-memory)");
  console.log("  E2E: govern → report → packet → export → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
