/**
 * V10.1 Payment Readiness Dashboard — verification
 */
import {
  PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  runPaymentReadinessDashboardRuntime,
  validatePaymentReadinessDashboard,
  buildPaymentReadinessEvidence,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-payment-readiness-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validatePaymentReadinessDashboard({ deploymentId: DEPLOYMENT_ID });
  assert(validation.dimensionsValid, "dimensions valid");
  assert(validation.overallValid, "overall valid");
  console.log("✓ payment readiness dashboard validation");

  const result = runPaymentReadinessDashboardRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(
    result.payload.version === PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION,
    "dashboard version",
  );
  assert(result.payload.dimensions.length === 4, "four dimensions");
  assert(result.payload.overallScore > 0, "overall score");
  const labels = result.payload.dimensions.map((dim) => dim.label);
  assert(labels.includes("Gateway Readiness"), "gateway readiness");
  assert(labels.includes("Webhook Readiness"), "webhook readiness");
  assert(labels.includes("Subscription Readiness"), "subscription readiness");
  assert(labels.includes("Settlement Readiness"), "settlement readiness");
  console.log("✓ payment readiness dashboard runtime");

  const evidence = buildPaymentReadinessEvidence({ deploymentId: DEPLOYMENT_ID });
  assert(evidence.domains.length === 6, "six domains");
  assert(evidence.runtimes.every((runtime) => runtime.status === "success"), "all success");
  console.log("✓ payment readiness evidence");
  console.log(`PASS — ${result.summary}`);
}

main();
