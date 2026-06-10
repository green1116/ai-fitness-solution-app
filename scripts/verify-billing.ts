/**
 * V10 Billing Runtime — verification
 */
import {
  BILLING_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runBillingRuntime,
  validateBillingRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-billing-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateBillingRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.snapshotValid, "billing snapshot valid");
  assert(validation.historyValid, "billing history valid");
  assert(validation.summaryValid, "billing summary valid");
  console.log("✓ billing validation");

  const result = runBillingRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(result.payload.version === BILLING_RUNTIME_VERSION, "billing runtime version");
  assert(result.payload.history.events.length >= 3, "billing events");
  assert(result.payload.snapshot.activeSubscriptions > 0, "active subscriptions");
  console.log("✓ billing runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
