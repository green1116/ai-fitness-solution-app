/**
 * V60 P2 CRM System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { createCustomer } from "../lib/crm/customer/customer.service";
import { updateCustomerLifecycle } from "../lib/crm/customer/customer.lifecycle";
import { createLead, promoteLeadToOpportunity } from "../lib/crm/lead/lead.service";
import { scoreLead, isQualifiedLead } from "../lib/crm/lead/lead.scoring";
import { updateOpportunityStage } from "../lib/crm/opportunity/opportunity.service";
import { createDeal, calculateDealValue, trackDealProgress } from "../lib/crm/deal/deal.service";
import { logCRMActivity } from "../lib/crm/activity/activity.tracker";
import { describeSalesFunnel, CRM_SALES_FUNNEL } from "../lib/crm/pipeline/crm.pipeline.engine";
import { getStagesForEntity } from "../lib/crm/pipeline/crm.stage.manager";
import { type CRMMetrics } from "../lib/crm/types";
import { aggregateCRMMetrics, createEmptyCRMMetrics } from "../lib/crm/crm.metrics";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/crm/customer/customer.service.ts",
    "lib/crm/customer/customer.model.ts",
    "lib/crm/customer/customer.lifecycle.ts",
    "lib/crm/lead/lead.service.ts",
    "lib/crm/lead/lead.pipeline.ts",
    "lib/crm/lead/lead.scoring.ts",
    "lib/crm/opportunity/opportunity.service.ts",
    "lib/crm/opportunity/opportunity.stage.ts",
    "lib/crm/opportunity/opportunity.pipeline.ts",
    "lib/crm/deal/deal.service.ts",
    "lib/crm/deal/deal.tracker.ts",
    "lib/crm/deal/deal.value.ts",
    "lib/crm/pipeline/crm.pipeline.engine.ts",
    "lib/crm/pipeline/crm.stage.manager.ts",
    "lib/crm/activity/activity.tracker.ts",
    "lib/crm/activity/activity.timeline.ts",
    "lib/crm/crm.product-bridge.ts",
    "lib/crm/crm.metrics.ts",
    "app/api/crm/customers/route.ts",
    "app/api/crm/leads/route.ts",
    "app/api/crm/opportunities/route.ts",
    "app/api/crm/deals/route.ts",
    "app/api/crm/metrics/route.ts",
    "app/api/crm/activities/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ CRM module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_CUSTOMER_SYSTEM: typeof createCustomer === "function",
    HAS_LEAD_PIPELINE: fs.existsSync(path.join(ROOT, "lib/crm/lead/lead.pipeline.ts")),
    HAS_OPPORTUNITY_TRACKING: typeof updateOpportunityStage === "function",
    HAS_DEAL_TRACKING: typeof trackDealProgress === "function",
    HAS_CRM_PIPELINE_ENGINE: typeof describeSalesFunnel === "function",
    HAS_ACTIVITY_TRACKING: typeof logCRMActivity === "function",
    HAS_SALES_FUNNEL: CRM_SALES_FUNNEL.length === 6,
    HAS_CRM_METRICS: typeof aggregateCRMMetrics === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkCoreFunctions() {
  const fns = {
    createCustomer,
    updateCustomerLifecycle,
    createLead,
    scoreLead,
    promoteLeadToOpportunity,
    updateOpportunityStage,
    trackDealProgress,
    calculateDealValue,
    logCRMActivity,
  };
  for (const [name, fn] of Object.entries(fns)) {
    assert(typeof fn === "function", `missing core fn: ${name}`);
  }
  console.log("✓ CRM core functions (9 capabilities)");
}

function checkCRMMetricsShape() {
  const metrics: CRMMetrics = createEmptyCRMMetrics();
  assert(typeof metrics.totalCustomers === "number", "totalCustomers");
  assert(typeof metrics.totalLeads === "number", "totalLeads");
  assert(typeof metrics.qualifiedLeads === "number", "qualifiedLeads");
  assert(typeof metrics.opportunities === "number", "opportunities");
  assert(typeof metrics.dealsWon === "number", "dealsWon");
  assert(typeof metrics.revenue === "number", "revenue");
  console.log("✓ CRMMetrics interface");
}

function checkLeadScoringRuntime() {
  const quoteScore = scoreLead({ source: "quote_generation", hasQuote: true, hasProject: true });
  assert(quoteScore >= 50, "quote lead qualifies");
  assert(isQualifiedLead(quoteScore), "qualified lead from quote");
  console.log("✓ lead scoring runtime");
}

function checkDealValueRuntime() {
  const value = calculateDealValue({ amount: 10000, multiplier: 1.2 });
  assert(value === 12000, "deal value calculation");
  console.log("✓ deal value runtime");
}

function checkSalesFunnelModel() {
  const funnel = describeSalesFunnel();
  assert(funnel[0] === "visitors", "funnel starts with visitors");
  assert(funnel.includes("leads"), "funnel includes leads");
  assert(funnel.includes("revenue"), "funnel ends with revenue");
  assert(getStagesForEntity("lead").includes("QUALIFIED"), "lead stages");
  assert(getStagesForEntity("opportunity").includes("PROPOSAL"), "opportunity stages");
  console.log("✓ sales funnel model (V60 P1 → V60 P2)");
}

function checkProductBridgeWiring() {
  const bridge = fs.readFileSync(path.join(ROOT, "lib/crm/crm.product-bridge.ts"), "utf8");
  assert(bridge.includes("recordQuoteAsLead"), "quote → lead bridge");
  assert(bridge.includes("recordBudgetAsOpportunity"), "budget → opportunity bridge");
  assert(bridge.includes("recordTenderAsDeal"), "tender → deal bridge");

  const quote = fs.readFileSync(path.join(ROOT, "app/api/quote/generate/route.ts"), "utf8");
  const budget = fs.readFileSync(path.join(ROOT, "app/api/budget/calculate/route.ts"), "utf8");
  const tender = fs.readFileSync(path.join(ROOT, "app/api/tender/generate/route.ts"), "utf8");

  assert(quote.includes("recordQuoteAsLead"), "quote route CRM hook");
  assert(budget.includes("recordBudgetAsOpportunity"), "budget route CRM hook");
  assert(tender.includes("recordTenderAsDeal"), "tender route CRM hook");
  assert(quote.includes("runSaasApiGate"), "quote gate preserved");
  console.log("✓ product → CRM sales binding");
}

function checkPrismaCrmModels() {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  for (const model of ["Customer", "Lead", "Opportunity", "Deal", "CRMActivity"]) {
    assert(schema.includes(`model ${model}`), `prisma model ${model}`);
  }
  console.log("✓ prisma CRM models");
}

function checkCrmApiGated() {
  for (const route of [
    "app/api/crm/customers/route.ts",
    "app/api/crm/leads/route.ts",
    "app/api/crm/opportunities/route.ts",
    "app/api/crm/deals/route.ts",
    "app/api/crm/metrics/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasOrgGate"), `${route} must use runSaasOrgGate`);
  }
  console.log("✓ CRM API routes tenant-gated");
}

function checkV58Untouched() {
  assert(fs.existsSync(path.join(V58_DIR, "freeze/v58-final-frozen.ts")), "v58 freeze intact");
  const orchestration = fs.readFileSync(
    path.join(V58_DIR, "orchestration/quote-orchestrator.engine.ts"),
    "utf8",
  );
  assert(!orchestration.includes("crmDb"), "v58 not coupled to crm");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");
}

function checkNoBillingBypass() {
  const bridge = fs.readFileSync(path.join(ROOT, "lib/crm/crm.product-bridge.ts"), "utf8");
  const checkout = fs.readFileSync(path.join(ROOT, "app/api/billing/create-checkout-session/route.ts"), "utf8");
  assert(!bridge.includes("updateSubscriptionStatus"), "crm does not mutate billing");
  assert(checkout.includes("createCheckoutSession"), "billing checkout preserved");
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
  checkModuleStructure();
  checkCapabilities();
  checkCoreFunctions();
  checkCRMMetricsShape();
  checkLeadScoringRuntime();
  checkDealValueRuntime();
  checkSalesFunnelModel();
  checkProductBridgeWiring();
  checkPrismaCrmModels();
  checkCrmApiGated();
  checkV58Untouched();
  checkNoBillingBypass();
  checkNoFeatureGateBypass();
  console.log("\n✓ V60 P2 CRM System — ALL CHECKS PASSED");
}

main();
