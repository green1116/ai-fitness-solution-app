import {
  CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION,
  runCustomerSuccessDashboardRuntime,
  validateCustomerSuccessDashboardRuntime,
  buildCustomerSuccessEvidence,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-customer-success-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCustomerSuccessDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runCustomerSuccessDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.adoptionHealth > 0, "adoption health");
const evidence = buildCustomerSuccessEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
