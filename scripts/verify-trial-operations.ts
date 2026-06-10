import {
  TRIAL_OPERATIONS_RUNTIME_VERSION,
  TRIAL_OUTCOMES,
  runTrialOperationsRuntime,
  validateTrialOperationsRuntime,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-trial-operations-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTrialOperationsRuntime({ deploymentId: ID }).valid, "validation");
const r = runTrialOperationsRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TRIAL_OPERATIONS_RUNTIME_VERSION, "version");
assert(r.payload.activeCount > 0, "active trials");
assert(TRIAL_OUTCOMES.includes(r.payload.trials[0].outcome), "outcome");
console.log(`PASS — ${r.summary}`);
