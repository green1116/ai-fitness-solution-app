/**
 * V10.1 Invoice Settlement Runtime — verification
 */
import {
  INVOICE_SETTLEMENT_RUNTIME_VERSION,
  PAYMENT_READINESS_VERSION,
  INVOICE_SETTLEMENT_STATUSES,
  runInvoiceSettlementRuntime,
  validateInvoiceSettlementRuntime,
  assertRuntimeSuccess,
} from "../lib/payment-readiness";

const DEPLOYMENT_ID = "v101-invoice-settlement-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateInvoiceSettlementRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.statesValid, "states valid");
  assert(validation.transitionsValid, "transitions valid");
  assert(validation.recordsValid, "records valid");
  console.log("✓ invoice settlement validation");

  const result = runInvoiceSettlementRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === PAYMENT_READINESS_VERSION, "readiness version");
  assert(
    result.payload.version === INVOICE_SETTLEMENT_RUNTIME_VERSION,
    "settlement version",
  );
  const statuses = new Set(result.payload.states.map((state) => state.status));
  for (const status of INVOICE_SETTLEMENT_STATUSES) {
    assert(statuses.has(status), status);
  }
  console.log("✓ invoice settlement runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
