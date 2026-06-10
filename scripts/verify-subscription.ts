/**
 * V10 Subscription Runtime — verification
 */
import {
  SUBSCRIPTION_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runSubscriptionRuntime,
  validateSubscriptionRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-subscription-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateSubscriptionRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.plansValid, "subscription plans valid");
  assert(validation.subscriptionsValid, "subscriptions valid");
  assert(validation.renewalsValid, "renewals valid");
  console.log("✓ subscription validation");

  const result = runSubscriptionRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(result.payload.version === SUBSCRIPTION_RUNTIME_VERSION, "subscription runtime version");
  assert(result.payload.plans.length === 3, "three billing cycles");
  const cycles = result.payload.plans.map((plan) => plan.cycle);
  assert(cycles.includes("monthly"), "monthly plan");
  assert(cycles.includes("annual"), "annual plan");
  assert(cycles.includes("enterprise"), "enterprise plan");
  console.log("✓ subscription runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
