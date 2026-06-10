/**
 * V10.1 Webhook Contract Runtime — verification
 */
import {
  WEBHOOK_CONTRACT_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  runWebhookContractRuntime,
  validateWebhookContractRuntime,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-webhook-contract-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateWebhookContractRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.eventSchemaValid, "event schema valid");
  assert(validation.signatureSchemaValid, "signature schema valid");
  assert(validation.retrySchemaValid, "retry schema valid");
  assert(validation.idempotencySchemaValid, "idempotency schema valid");
  console.log("✓ webhook contract validation");

  const result = runWebhookContractRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(result.payload.version === WEBHOOK_CONTRACT_RUNTIME_VERSION, "webhook version");
  assert(result.payload.retrySchema.maxAttempts >= 3, "retry attempts");
  assert(result.payload.idempotencySchema.ttlSeconds > 0, "idempotency ttl");
  console.log("✓ webhook contract runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
