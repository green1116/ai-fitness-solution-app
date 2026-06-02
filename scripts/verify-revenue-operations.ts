/**
 * V8.7 Revenue Operations Platform — verification
 */
import {
  REVENUE_OPERATIONS_VERSION,
  buildPipelineStages,
  buildPipeline,
  buildRevenueMetrics,
  buildRevenueForecast,
  buildRevenueReport,
  buildRevenueReports,
  buildRevenueSummary,
  buildRevenueOperationsResponse,
  validateRevenueOperations,
} from "../lib/productization/revenue";

const DEPLOYMENT_ID = "v87-revenue-operations-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testPipeline() {
  const stages = buildPipelineStages();
  assert(stages.length === 7, "pipeline stages count");
  const kinds = stages.map((s) => s.kind);
  assert(kinds.includes("lead"), "lead stage");
  assert(kinds.includes("qualified"), "qualified stage");
  assert(kinds.includes("proposal"), "proposal stage");
  assert(kinds.includes("trial"), "trial stage");
  assert(kinds.includes("negotiation"), "negotiation stage");
  assert(kinds.includes("won"), "won stage");
  assert(kinds.includes("lost"), "lost stage");

  const pipeline = buildPipeline({ deploymentId: DEPLOYMENT_ID });
  assert(pipeline.length > 0, "pipeline opportunities");
  for (const opp of pipeline) {
    assert(opp.opportunityId.length > 0, "opportunity id");
    assert(opp.value >= 0, "opportunity value");
    assert(opp.probability >= 0 && opp.probability <= 100, "opportunity probability");
  }
  console.log("✓ pipeline valid");
}

function testMetrics() {
  const metrics = buildRevenueMetrics({ deploymentId: DEPLOYMENT_ID });
  assert(metrics.metricsId.length > 0, "metrics id");
  assert(metrics.pipelineValue >= 0, "pipeline value");
  assert(metrics.forecastRevenue >= 0, "forecast revenue");
  assert(metrics.closedRevenue >= 0, "closed revenue");
  assert(metrics.expansionRevenue >= 0, "expansion revenue");
  assert(metrics.renewalRevenue >= 0, "renewal revenue");
  assert(metrics.arr >= 0, "arr");
  assert(metrics.mrr >= 0, "mrr");
  console.log("✓ metrics valid");
  console.log(" ", metrics.summary);
}

function testForecast() {
  const forecast = buildRevenueForecast({ deploymentId: DEPLOYMENT_ID });
  assert(forecast.forecastId.length > 0, "forecast id");
  assert(forecast.bestCase >= forecast.expectedCase, "best >= expected");
  assert(forecast.expectedCase >= forecast.worstCase, "expected >= worst");
  assert(forecast.currency.length > 0, "currency");
  console.log("✓ forecast valid");
  console.log(" ", forecast.summary);
}

function testReporting() {
  const reports = buildRevenueReports({ deploymentId: DEPLOYMENT_ID });
  assert(reports.length === 3, "report periods");
  const periods = reports.map((r) => r.period);
  assert(periods.includes("monthly"), "monthly report");
  assert(periods.includes("quarterly"), "quarterly report");
  assert(periods.includes("annual"), "annual report");

  const report = buildRevenueReport({ deploymentId: DEPLOYMENT_ID, period: "quarterly" });
  assert(report.reportId.length > 0, "report id");
  assert(report.pipelineValue >= 0, "report pipeline");
  console.log("✓ reporting valid");
}

function testSummaryAndResponse() {
  const summary = buildRevenueSummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === REVENUE_OPERATIONS_VERSION, "summary version");
  assert(summary.summaryId.length > 0, "summary id");
  assert(summary.totalOpportunities > 0, "total opportunities");
  assert(summary.summary.length > 0, "summary text");

  const response = buildRevenueOperationsResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.pipeline.length === summary.totalOpportunities, "response pipeline");
  assert(response.metrics.metricsId === summary.metrics.metricsId, "response metrics");
  assert(response.forecast.forecastId.length > 0, "response forecast");
  assert(response.report.period === "quarterly", "response report period");

  const validation = validateRevenueOperations({ deploymentId: DEPLOYMENT_ID });
  assert(validation.pipelineValid, "pipeline valid");
  assert(validation.metricsValid, "metrics valid");
  assert(validation.forecastValid, "forecast valid");
  assert(validation.reportingValid, "reporting valid");
  assert(validation.summaryValid, "summary valid");

  console.log("✓ summary valid");
  console.log(" ", summary.summary);
  console.log("");
  console.log("REVENUE OPERATIONS VERIFY PASS");
}

function main() {
  testPipeline();
  testMetrics();
  testForecast();
  testReporting();
  testSummaryAndResponse();
}

main();
