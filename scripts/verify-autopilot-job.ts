import {
  AUTOPILOT_JOB_RUNTIME_VERSION,
  JOB_TYPES,
  runAutopilotJobRuntime,
  validateAutopilotJobRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-autopilot-job-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAutopilotJobRuntime({ deploymentId: ID }).valid, "validation");
const r = runAutopilotJobRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AUTOPILOT_JOB_RUNTIME_VERSION, "version");
assert(r.payload.supportedTypes.length === JOB_TYPES.length, "job types");
console.log(`PASS — ${r.summary}`);
