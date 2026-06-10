import {
  IMPLEMENTATION_PLAN_RUNTIME_VERSION,
  runImplementationPlanRuntime,
  validateImplementationPlanRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-implementation-plan-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateImplementationPlanRuntime({ deploymentId: ID }).valid, "validation");
const r = runImplementationPlanRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === IMPLEMENTATION_PLAN_RUNTIME_VERSION, "version");
assert(r.payload.milestones.length >= 4, "milestones");
assert(r.payload.phases.length >= 3, "phases");
console.log(`PASS — ${r.summary}`);
