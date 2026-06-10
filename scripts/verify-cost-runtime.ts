import {
  COST_RUNTIME_VERSION,
  runCostRuntime,
  validateCostRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-cost-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCostRuntime({ deploymentId: ID }).valid, "validation");
const r = runCostRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COST_RUNTIME_VERSION, "cost version");
assert(r.payload.monthlyCost.amountUsd > r.payload.proposalCost.amountUsd, "monthly > proposal");
console.log(`PASS — ${r.summary}`);
