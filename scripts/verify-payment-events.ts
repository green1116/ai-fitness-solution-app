/**
 * V10.1 Payment Event Runtime — verification
 */
import {
  PAYMENT_EVENTS_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  PAYMENT_EVENT_KINDS,
  runPaymentEventsRuntime,
  validatePaymentEventsRuntime,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-payment-events-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validatePaymentEventsRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.definitionsValid, "definitions valid");
  assert(validation.samplesValid, "samples valid");
  console.log("✓ payment events validation");

  const result = runPaymentEventsRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(result.payload.version === PAYMENT_EVENTS_RUNTIME_VERSION, "events version");
  assert(result.payload.definitions.length === PAYMENT_EVENT_KINDS.length, "event kinds");
  const kinds = new Set(result.payload.definitions.map((def) => def.kind));
  assert(kinds.has("checkout.created"), "checkout.created");
  assert(kinds.has("payment.succeeded"), "payment.succeeded");
  assert(kinds.has("subscription.renewed"), "subscription.renewed");
  console.log("✓ payment events runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
