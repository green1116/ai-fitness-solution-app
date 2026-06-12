import {
  SUBMISSION_READINESS_RUNTIME_VERSION,
  runSubmissionReadinessRuntime,
  validateSubmissionReadinessRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-submission-readiness-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateSubmissionReadinessRuntime({ deploymentId: ID }).valid, "validation");
const r = runSubmissionReadinessRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === SUBMISSION_READINESS_RUNTIME_VERSION, "version");
assert(r.payload.averageSubmissionReadinessScore >= 95, "submission readiness >= 95%");
console.log(`PASS — ${r.summary}`);
