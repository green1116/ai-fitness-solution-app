import {
  CUSTOMER_HEALTH_RUNTIME_VERSION,
  HEALTH_STATUSES,
  runCustomerHealthRuntime,
  validateCustomerHealthRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-customer-health-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCustomerHealthRuntime({ deploymentId: ID }).valid, "validation");
const r = runCustomerHealthRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CUSTOMER_HEALTH_RUNTIME_VERSION, "version");
assert(r.payload.customers.length >= 3, "customers");
assert(HEALTH_STATUSES.includes(r.payload.customers[0].status), "status");
console.log(`PASS — ${r.summary}`);
