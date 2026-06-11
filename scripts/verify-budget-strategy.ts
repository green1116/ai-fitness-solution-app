import {
  BUDGET_STRATEGY_RUNTIME_VERSION,
  runBudgetStrategyRuntime,
  validateBudgetStrategyRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-budget-strategy-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetStrategyRuntime({ deploymentId: ID, bidderBrand: "Shuhua" }).valid, "validation");
const r = runBudgetStrategyRuntime({ deploymentId: ID, bidderBrand: "Shuhua" });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_STRATEGY_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.selectedStrategy.tier === "value", "value tier");
console.log(`PASS — ${r.summary}`);
