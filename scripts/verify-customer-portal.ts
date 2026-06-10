import {
  CUSTOMER_PORTAL_RUNTIME_VERSION,
  runCustomerPortalRuntime,
  validateCustomerPortalRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-customer-portal-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCustomerPortalRuntime({ deploymentId: ID }).valid, "validation");
const r = runCustomerPortalRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CUSTOMER_PORTAL_RUNTIME_VERSION, "version");
assert(r.payload.projectView.deliverableCount === 4, "views");
console.log(`PASS — ${r.summary}`);
