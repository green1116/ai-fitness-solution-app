/**
 * V10 Order Runtime — verification
 */
import {
  ORDER_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runOrderRuntime,
  validateOrderRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-order-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateOrderRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.modelValid, "order model valid");
  assert(validation.lifecycleValid, "order lifecycle valid");
  assert(validation.summaryValid, "order summary valid");
  console.log("✓ order validation");

  const result = runOrderRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(result.payload.version === ORDER_RUNTIME_VERSION, "order runtime version");
  assert(result.payload.lifecycle.currentStage === "closed", "lifecycle closed");
  assert(result.payload.order.currency === "CNY", "currency CNY");
  console.log("✓ order runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
