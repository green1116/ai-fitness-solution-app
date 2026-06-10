/**
 * V10 Invoice Runtime — verification
 */
import {
  INVOICE_RUNTIME_VERSION,
  REVENUE_FOUNDATION_VERSION,
  runInvoiceRuntime,
  validateInvoiceRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-foundation";

const DEPLOYMENT_ID = "v10-invoice-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const validation = validateInvoiceRuntime({ deploymentId: DEPLOYMENT_ID });
  assert(validation.modelValid, "invoice model valid");
  assert(validation.summaryValid, "invoice summary valid");
  console.log("✓ invoice validation");

  const result = runInvoiceRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(result);
  assert(result.version === REVENUE_FOUNDATION_VERSION, "foundation version");
  assert(result.payload.version === INVOICE_RUNTIME_VERSION, "invoice runtime version");
  const statuses = new Set(result.payload.invoices.map((inv) => inv.status));
  assert(statuses.has("paid"), "paid invoice");
  assert(statuses.has("overdue"), "overdue invoice");
  assert(result.payload.summary.totalCollected > 0, "collected revenue");
  console.log("✓ invoice runtime");
  console.log(`PASS — ${result.summary}`);
}

main();
