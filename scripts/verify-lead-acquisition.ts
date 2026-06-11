import {
  LEAD_ACQUISITION_RUNTIME_VERSION,
  runLeadAcquisitionRuntime,
  validateLeadAcquisitionRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-lead-acquisition-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateLeadAcquisitionRuntime({ deploymentId: ID }).valid, "validation");
const r = runLeadAcquisitionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === LEAD_ACQUISITION_RUNTIME_VERSION, "version");
assert(r.payload.pipelineCount > 0, "pipeline");
console.log(`PASS — ${r.summary}`);
