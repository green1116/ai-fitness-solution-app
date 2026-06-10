/**
 * V10.1 Subscription Sync Runtime — verification
 */
import {
  SUBSCRIPTION_SYNC_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  SUBSCRIPTION_SYNC_ACTIONS,
  runSubscriptionSyncRuntime,
  validateSubscriptionSyncRuntime,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-subscription-sync-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateSubscriptionSyncRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.transitionsValid, "transitions valid");
  assert(validation.lifecycleValid, "lifecycle valid");
  console.log("✓ subscription sync validation");

  const result = runSubscriptionSyncRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(result.payload.version === SUBSCRIPTION_SYNC_RUNTIME_VERSION, "sync version");
  assert(result.payload.transitions.length === SUBSCRIPTION_SYNC_ACTIONS.length, "sync actions");
  const actions = new Set(result.payload.transitions.map((t) => t.action));
  assert(actions.has("activate"), "activate");
  assert(actions.has("renew"), "renew");
  assert(actions.has("cancel"), "cancel");
  assert(actions.has("expire"), "expire");
  console.log("✓ subscription sync runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
