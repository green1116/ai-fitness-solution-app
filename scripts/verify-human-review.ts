import {
  HUMAN_REVIEW_RUNTIME_VERSION,
  REVIEW_DECISIONS,
  runHumanReviewRuntime,
  validateHumanReviewRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-human-review-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateHumanReviewRuntime({ deploymentId: ID }).valid, "validation");
const r = runHumanReviewRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === HUMAN_REVIEW_RUNTIME_VERSION, "version");
assert(r.payload.gates.length === 8, "gates");
assert(REVIEW_DECISIONS.length === 3, "decisions");
console.log(`PASS — ${r.summary}`);
