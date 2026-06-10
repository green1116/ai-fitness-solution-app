import {
  LEAD_RUNTIME_VERSION,
  LEAD_STATUSES,
  runLeadRuntime,
  validateLeadRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-lead-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateLeadRuntime({ deploymentId: ID }).valid, "validation");
const r = runLeadRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === LEAD_RUNTIME_VERSION, "version");
assert(r.payload.leadCount >= 3, "leads");
assert(LEAD_STATUSES.includes(r.payload.leads[0].status), "status");
console.log(`PASS — ${r.summary}`);
