/**
 * V90 — Portfolio intelligence & segmentation verification
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
import {
  buildPortfolioAccountDetail,
  buildPortfolioDashboard,
  classifyPortfolioSegments,
  clearPortfolioCacheForTests,
  listPortfolioPriorityActions,
  recordPortfolioPriorityAction,
  V90_PORTFOLIO_VERSION,
} from "../lib/pilot/v90";

const SAMPLE = `项目名称：星河科技园`.trim();
const ORG = "org-v90";
const ACTOR = "portfolio-intel";

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
  console.log("V90 — Portfolio Intelligence & Segmentation\n");
  clearIntakeStoreForTests();
  clearDeliveryOpsStoreForTests();
  clearForecastCacheForTests();
  clearRenewalOpsStoreForTests();
  clearRevenueOpsStoreForTests();
  clearGrowthOpsStoreForTests();
  clearExpansionOpsStoreForTests();
  clearPortfolioCacheForTests();

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
    productionProjectId: "proj-v90",
    productionQuoteId: "quote-v90",
    productionTenderId: "tender-v90",
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

  console.log("✓ expansion ops ready");

  const { buildExpansionOpsDashboard } = await import("../lib/pilot/v89");
  const { buildAccountHealthDashboard } = await import("../lib/pilot/v85");
  const expansion = buildExpansionOpsDashboard(ORG);
  const health = buildAccountHealthDashboard(ORG);
  const account = health.accounts.find((a) => a.sessionId === session.id);
  const expansionItem = expansion.allItems.find((i) => i.sessionId === session.id) ?? null;
  assert(Boolean(account), "account");

  const segments = classifyPortfolioSegments({
    account: account!,
    expansionItem,
    growthItem: null,
    revenueItem: null,
    baseRenewalValue: expansionItem?.baseRenewalValue ?? 50_000,
  });
  assert(segments.length >= 1, "segmentation");
  console.log(`✓ expansion → segment (${segments.join(", ")})`);

  const dashboard = buildPortfolioDashboard(ORG, { useCache: true });
  assert(dashboard.version === V90_PORTFOLIO_VERSION, "version");
  assert(dashboard.readOnly === true, "read only");
  assert(dashboard.rankedAccounts.length >= 1, "ranked accounts");
  assert(dashboard.prioritization.topAccounts.length >= 1, "prioritization");
  assert(dashboard.segmentCards.length >= 1, "segment cards");
  console.log("✓ prioritize + dashboard");

  recordPortfolioPriorityAction({
    sessionId: session.id,
    organizationId: ORG,
    actorId: ACTOR,
    note: "组合优先级确认",
  });
  assert(listPortfolioPriorityActions(session.id, ORG).length >= 1, "portfolio act");
  console.log("✓ record priority act");

  const cached = buildPortfolioDashboard(ORG, { useCache: true });
  assert(cached.summary.totalAccounts >= 1, "cached dashboard");
  console.log("✓ portfolio cache");

  const detail = buildPortfolioAccountDetail(session.id, ORG);
  assert(detail.actionHistory.some((a) => a.source === "portfolio"), "timeline");
  console.log("✓ drilldown timeline");

  console.log("\nPASS — V90 portfolio intelligence (in-memory)");
  console.log("  E2E: expansion → segment → prioritize → act → dashboard");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
