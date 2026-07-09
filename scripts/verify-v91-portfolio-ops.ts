/**
 * V91 — Portfolio ops & strategic actions verification
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
import {
  assignPortfolioOwner,
  buildPortfolioOpsDashboard,
  buildPortfolioOpsDetail,
  buildPortfolioOpsPipeline,
  classifyPortfolioOpsQueue,
  clearPortfolioOpsStoreForTests,
  listPortfolioOpsActions,
  markPortfolioCompleted,
  recordStrategicAction,
  V91_PORTFOLIO_OPS_VERSION,
} from "../lib/pilot/v91";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v91";
const ACTOR = "portfolio-ops";

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
  console.log("V91 — Portfolio Ops & Strategic Actions\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();
  clearExpansionOpsStoreForTests();
  clearPortfolioCacheForTests();
  clearPortfolioOpsStoreForTests();

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
    productionProjectId: "proj-v91",
    productionQuoteId: "quote-v91",
    productionTenderId: "tender-v91",
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

  console.log("✓ portfolio intelligence ready");

  const { buildPortfolioDashboard } = await import("../lib/pilot/v90");
  const portfolio = buildPortfolioDashboard(ORG);
  const account = portfolio.rankedAccounts.find((a) => a.sessionId === session.id);
  assert(Boolean(account), "portfolio account");

  const queue = classifyPortfolioOpsQueue({ account: account!, opsOutcome: "open" });
  assert(queue !== null, "prioritize ops queue");
  console.log(`✓ portfolio → prioritize (${queue})`);

  const pipeline = buildPortfolioOpsPipeline(ORG);
  assert(pipeline.allItems.length >= 1, "ops pipeline");
  console.log("✓ strategic queues");

  const dashboard = buildPortfolioOpsDashboard(ORG);
  assert(dashboard.version === V91_PORTFOLIO_OPS_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  console.log("✓ portfolio ops dashboard");

  assignPortfolioOwner({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    ownerId: ACTOR,
    ownerName: "Portfolio Rep",
  });
  console.log("✓ assign owner");

  recordStrategicAction({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "战略干预启动",
  });
  assert(listPortfolioOpsActions(session.id).length >= 2, "strategic actions");
  console.log("✓ record action");

  markPortfolioCompleted({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "战略行动完成",
  });

  const afterComplete = buildPortfolioOpsDashboard(ORG);
  assert(afterComplete.summary.completed >= 1, "completed outcome");
  console.log("✓ mark completed");

  const detail = buildPortfolioOpsDetail(session.id, ORG);
  assert(detail.actionHistory.length >= 3, "action timeline");
  assert(detail.accountStrategy.readOnly === true, "strategy view");
  console.log("✓ drilldown + strategy view");

  console.log("\nPASS — V91 portfolio ops (in-memory)");
  console.log("  E2E: portfolio → prioritize → assign → act → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
