/**
 * V10 Revenue Dashboard Runtime — verification
 */
import {
  REVENUE_DASHBOARD_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runRevenueDashboardRuntime,
  validateRevenueDashboardRuntime,
  assertRuntimeSuccess,
  buildRevenueFoundationEvidence,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-revenue-dashboard-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateRevenueDashboardRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.metricsValid, "dashboard metrics valid");
  console.log("✓ revenue dashboard validation");

  const result = runRevenueDashboardRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(
    result.payload.version === REVENUE_DASHBOARD_RUNTIME_VERSION,
    "dashboard runtime version",
  );
  assert(result.payload.metrics.mrr > 0, "mrr positive");
  assert(result.payload.metrics.arr === result.payload.metrics.mrr * 12, "arr = mrr * 12");
  assert(result.payload.metrics.activeCustomers > 0, "active customers");
  assert(result.payload.metrics.trialConversionRate > 0, "trial conversion");
  assert(result.payload.metrics.revenueGrowthRate > 0, "revenue growth");
  console.log("✓ revenue dashboard runtime");

  const evidence = buildRevenueFoundationEvidence({ deploymentId: DEPLOYMENT_ID });
  assert(evidence.domains.length === 6, "six domains in evidence");
  assert(evidence.runtimes.every((runtime) => runtime.status === "success"), "all runtimes success");
  console.log("✓ revenue foundation evidence");
  console.log(`PASS — ${result.summary}`);
}

main();
