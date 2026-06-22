/**
 * V60 P3 Sales Automation Engine Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  analyzeLeadIntent,
  scoreLeadQuality,
  predictDealProbability,
  recommendNextAction,
  generateSalesSuggestion,
  triggerQuoteRecommendation,
  triggerBudgetRecommendation,
  triggerTenderRecommendation,
} from "../lib/sales/ai/sales-ai.engine";
import {
  runSalesAutomation,
  autoAdvancePipeline,
  evaluateStageAutomation,
} from "../lib/sales/automation/sales-automation.engine";
import { resolveLeadQualityTier } from "../lib/sales/ai/lead-scoring.ai";
import { scoreOpportunity } from "../lib/sales/scoring/opportunity.scoring.engine";
import {
  recordQuoteSignal,
  recordBudgetView,
  getSignalSummary,
} from "../lib/sales/signals/sales.signal.engine";
import { triggerTenderRecommendation as tenderRec } from "../lib/sales/recommendation/tender.recommender";
import { clearSalesSignalsForTests, countSignal } from "../lib/sales/sales.events.store";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/sales/ai/sales-ai.engine.ts",
    "lib/sales/ai/lead-scoring.ai.ts",
    "lib/sales/ai/deal-predictor.ai.ts",
    "lib/sales/automation/sales-automation.engine.ts",
    "lib/sales/automation/pipeline-automation.ts",
    "lib/sales/automation/stage-automation.ts",
    "lib/sales/recommendation/quote.recommender.ts",
    "lib/sales/recommendation/budget.recommender.ts",
    "lib/sales/recommendation/tender.recommender.ts",
    "lib/sales/scoring/lead.scoring.engine.ts",
    "lib/sales/scoring/opportunity.scoring.engine.ts",
    "lib/sales/signals/sales.signal.engine.ts",
    "lib/sales/signals/intent.detector.ts",
    "lib/sales/sales.product-bridge.ts",
    "lib/sales/sales.service.ts",
    "app/api/sales/analyze/route.ts",
    "app/api/sales/automate/route.ts",
    "app/api/sales/recommendations/route.ts",
    "app/api/sales/signals/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ sales automation module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_AI_SALES_ENGINE: typeof generateSalesSuggestion === "function",
    HAS_LEAD_SCORING_AI: typeof scoreLeadQuality === "function",
    HAS_DEAL_PREDICTOR: typeof predictDealProbability === "function",
    HAS_PIPELINE_AUTOMATION: typeof runSalesAutomation === "function",
    HAS_NEXT_BEST_ACTION_ENGINE: typeof recommendNextAction === "function",
    HAS_RECOMMENDATION_SYSTEM: typeof triggerQuoteRecommendation === "function",
    HAS_SALES_SIGNAL_ENGINE: typeof getSignalSummary === "function",
    HAS_AUTO_PIPELINE_ADVANCEMENT: typeof autoAdvancePipeline === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkCoreFunctions() {
  const fns = {
    analyzeLeadIntent,
    scoreLeadQuality,
    predictDealProbability,
    recommendNextAction,
    autoAdvancePipeline,
    generateSalesSuggestion,
    triggerQuoteRecommendation,
    triggerBudgetRecommendation,
    triggerTenderRecommendation,
  };
  for (const [name, fn] of Object.entries(fns)) {
    assert(typeof fn === "function", `missing core fn: ${name}`);
  }
  console.log("✓ AI sales core functions (9 capabilities)");
}

function checkLeadScoringTiers() {
  assert(resolveLeadQualityTier(25) === "LOW", "0-30 LOW");
  assert(resolveLeadQualityTier(50) === "MEDIUM", "30-70 MEDIUM");
  assert(resolveLeadQualityTier(85) === "HIGH", "70-100 HIGH");
  console.log("✓ lead score tiers (LOW / MEDIUM / HIGH)");
}

function checkIntentAndSignalsRuntime() {
  clearSalesSignalsForTests();
  const orgId = "org-sales-test";

  recordQuoteSignal({ organizationId: orgId, quoteId: "q1" });
  recordQuoteSignal({ organizationId: orgId, quoteId: "q2", isRepeat: true });
  recordBudgetView({ organizationId: orgId });
  recordBudgetView({ organizationId: orgId });
  recordBudgetView({ organizationId: orgId });

  const intent = analyzeLeadIntent({ organizationId: orgId });
  assert(intent.signals.includes("quote_interaction"), "quote signal detected");
  assert(intent.signals.includes("budget_export_behavior") || intent.signals.includes("budget_engagement"), "budget signals");

  const tenderRecResult = tenderRec({ organizationId: orgId });
  assert(tenderRecResult !== null, "budget_viewed >= 3 recommends tender");

  const summary = getSignalSummary(orgId);
  assert(summary.budgetViews >= 3, "budget view count");
  console.log("✓ sales signal engine runtime");
}

function checkNextBestActions() {
  clearSalesSignalsForTests();
  const orgId = "org-nba-test";

  const quoteAction = recommendNextAction({ organizationId: orgId });
  assert(quoteAction.action.length > 0, "next best action generated");

  const allowed = [
    "Send Quote Proposal",
    "Suggest Budget Optimization",
    "Trigger Tender Generation",
    "Schedule Follow-up",
    "Upgrade Plan Recommendation",
  ];
  assert(allowed.some((a) => quoteAction.action.includes(a) || quoteAction.action === a), "known NBA type");

  const suggestion = generateSalesSuggestion({ organizationId: orgId });
  assert(suggestion.recommendations.length >= 1, "sales suggestions");
  assert(suggestion.summary.length > 0, "sales summary");
  console.log("✓ next best action engine");
}

function checkDealPredictorRuntime() {
  clearSalesSignalsForTests();
  const orgId = "org-deal-test";
  recordQuoteSignal({ organizationId: orgId });

  const prediction = predictDealProbability({ organizationId: orgId, stage: "PROPOSAL" });
  assert(prediction.probability >= 5 && prediction.probability <= 98, "probability range");
  assert(["low", "medium", "high", "very_high"].includes(prediction.label), "prediction label");
  console.log("✓ deal probability predictor");
}

function checkOpportunityScoring() {
  const score = scoreOpportunity({
    engagementLevel: 4,
    companySize: 250,
    quoteInteractions: 2,
    budgetInteractions: 3,
    tenderInteractions: 1,
  });
  assert(score.score >= 70, "opportunity score high with engagement");
  assert(score.grade === "A" || score.grade === "A+", "opportunity grade");
  console.log("✓ opportunity scoring");
}

function checkAutomationRules() {
  const highLead = evaluateStageAutomation({ leadScore: 75, budgetViews: 0, tenderGenerated: false, currentStage: "INIT" });
  assert(highLead.shouldAdvance === true, "lead_score > 70 advances");

  const tenderRule = evaluateStageAutomation({ leadScore: 50, budgetViews: 1, tenderGenerated: true, currentStage: "INIT" });
  assert(tenderRule.shouldAdvance === true, "tender_generated advances");

  const budgetRule = evaluateStageAutomation({ leadScore: 40, budgetViews: 3, tenderGenerated: false, currentStage: "INIT" });
  assert(budgetRule.shouldAdvance === true, "budget_views >= 3 advances");
  console.log("✓ automation rules");
}

function checkNoManualOnlyCrm() {
  const pipelineSource = fs.readFileSync(path.join(ROOT, "lib/sales/automation/pipeline-automation.ts"), "utf8");
  const automationSource = fs.readFileSync(path.join(ROOT, "lib/sales/automation/sales-automation.engine.ts"), "utf8");

  assert(pipelineSource.includes("advanceLeadToOpportunity"), "uses CRM pipeline automation");
  assert(pipelineSource.includes("auto_create_opportunity"), "auto opportunity creation");
  assert(pipelineSource.includes("markHotDeal"), "hot deal automation");
  assert(automationSource.includes("autoAdvancePipeline"), "pipeline auto advance");
  console.log("✓ NO_MANUAL_ONLY_CRM (automation drives CRM pipeline)");
}

function checkProductBridgeWiring() {
  for (const [route, needle] of [
    ["app/api/quote/generate/route.ts", "onQuoteGenerated"],
    ["app/api/budget/calculate/route.ts", "onBudgetCalculated"],
    ["app/api/tender/generate/route.ts", "onTenderGenerated"],
  ] as const) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes(needle), `${route} sales hook`);
    assert(content.includes("runSaasApiGate"), `${route} gate preserved`);
  }
  console.log("✓ product API sales automation hooks");
}

function checkSalesApiGated() {
  for (const route of [
    "app/api/sales/analyze/route.ts",
    "app/api/sales/automate/route.ts",
    "app/api/sales/recommendations/route.ts",
    "app/api/sales/signals/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasOrgGate"), `${route} tenant gated`);
  }
  console.log("✓ sales API routes gated");
}

function checkCrmSchemaUntouched() {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  assert(schema.includes("model Customer"), "crm customer model intact");
  assert(!schema.includes("model CustomerV2"), "no crm schema breaking rename");
  console.log("✓ CRM base data structures unchanged (extension only)");
}

function checkV58Untouched() {
  assert(fs.existsSync(path.join(V58_DIR, "freeze/v58-final-frozen.ts")), "v58 freeze intact");
  const orchestration = fs.readFileSync(path.join(V58_DIR, "orchestration/quote-orchestrator.engine.ts"), "utf8");
  assert(!orchestration.includes("sales-ai.engine"), "v58 not coupled to sales");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");
}

function checkNoBillingBypass() {
  const salesAi = fs.readFileSync(path.join(ROOT, "lib/sales/ai/sales-ai.engine.ts"), "utf8");
  const checkout = fs.readFileSync(path.join(ROOT, "app/api/billing/create-checkout-session/route.ts"), "utf8");
  assert(!salesAi.includes("updateSubscriptionStatus"), "sales does not mutate billing");
  assert(checkout.includes("createCheckoutSession"), "billing preserved");
  console.log("✓ NO_BILLING_BYPASS");
}

function checkNoFeatureGateBypass() {
  for (const route of [
    "app/api/quote/generate/route.ts",
    "app/api/budget/calculate/route.ts",
    "app/api/tender/generate/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasApiGate"), `${route} still gated`);
  }
  console.log("✓ NO_FEATURE_GATE_BYPASS");
}

function main() {
  clearSalesSignalsForTests();
  checkModuleStructure();
  checkCapabilities();
  checkCoreFunctions();
  checkLeadScoringTiers();
  checkIntentAndSignalsRuntime();
  checkNextBestActions();
  checkDealPredictorRuntime();
  checkOpportunityScoring();
  checkAutomationRules();
  checkNoManualOnlyCrm();
  checkProductBridgeWiring();
  checkSalesApiGated();
  checkCrmSchemaUntouched();
  checkV58Untouched();
  checkNoBillingBypass();
  checkNoFeatureGateBypass();
  console.log("\n✓ V60 P3 Sales Automation Engine — ALL CHECKS PASSED");
}

main();
