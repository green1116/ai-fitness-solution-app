import {
  BUDGET_INTELLIGENCE_RUNTIME_VERSION,
  runBudgetIntelligenceRuntime,
  validateBudgetIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-budget-intel-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runBudgetIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.budget.estimatedBudgetCny > 0, "budget");
console.log(`PASS — ${r.summary}`);
