/**
 * V89 — Expansion ops & account growth verification
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
import {
  assignExpansionOwner,
  buildExpansionOpsDashboard,
  buildExpansionOpsDetail,
  buildExpansionPipeline,
  clearExpansionOpsStoreForTests,
  listExpansionOpsActions,
  markExpansionExpanded,
  qualifyExpansionQueue,
  recordExpansionProposal,
  V89_EXPANSION_OPS_VERSION,
} from "../lib/pilot/v89";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v89";
const ACTOR = "expansion-ops";

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
  console.log("V89 — Expansion Ops & Account Growth\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();
  clearExpansionOpsStoreForTests();

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
    productionProjectId: "proj-v89",
    productionQuoteId: "quote-v89",
    productionTenderId: "tender-v89",
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

  console.log("✓ growth planning ready");

  const { buildGrowthPlanningDashboard } = await import("../lib/pilot/v88");
  const growth = buildGrowthPlanningDashboard(ORG);
  const growthItem = growth.allItems.find((i) => i.sessionId === session.id);
  assert(Boolean(growthItem), "growth item");
  const queue = qualifyExpansionQueue({ growthItem: growthItem!, expansionOutcome: "open" });
  assert(queue !== null, "qualify expansion queue");
  console.log(`✓ growth → qualify (${queue})`);

  const pipeline = buildExpansionPipeline(ORG);
  assert(pipeline.allItems.length >= 1, "expansion pipeline");
  console.log("✓ expansion queues");

  const dashboard = buildExpansionOpsDashboard(ORG);
  assert(dashboard.version === V89_EXPANSION_OPS_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  console.log("✓ expansion dashboard");

  assignExpansionOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Expansion Rep",
  });
  console.log("✓ assign owner");

  recordExpansionProposal({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "扩展方案 v1",
    proposalValue: 15000,
  });
  assert(listExpansionOpsActions(session.id).some((a) => a.action === "record_proposal"), "proposal");
  console.log("✓ record proposal");

  markExpansionExpanded({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "扩展成交",
  });

  const afterClose = buildExpansionOpsDashboard(ORG);
  assert(afterClose.summary.expanded >= 1, "expanded tracked");
  console.log("✓ mark expanded / close");

  const detail = buildExpansionOpsDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 3, "action timeline");
  assert(detail.accountGrowth.readOnly === true, "account growth view");
  console.log("✓ drilldown + account growth");

  console.log("\nPASS — V89 expansion ops (in-memory)");
  console.log("  E2E: growth → qualify → propose → close → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
