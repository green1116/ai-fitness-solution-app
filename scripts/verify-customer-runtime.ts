import {
  CUSTOMER_RUNTIME_VERSION,
  CUSTOMER_TIERS,
  runCustomerRuntime,
  validateCustomerRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-customer-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCustomerRuntime({ deploymentId: ID }).valid, "validation");
const r = runCustomerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CUSTOMER_RUNTIME_VERSION, "version");
assert(r.payload.customerCount >= 3, "customers");
assert(CUSTOMER_TIERS.includes(r.payload.customers[0].tier), "tier");
console.log(`PASS — ${r.summary}`);
