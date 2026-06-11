import {
  BRAND_STRATEGY_RUNTIME_VERSION,
  runBrandStrategyRuntime,
  validateBrandStrategyRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-brand-strategy-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBrandStrategyRuntime({ deploymentId: ID, bidderBrand: "Technogym" }).valid, "validation");
const r = runBrandStrategyRuntime({ deploymentId: ID, bidderBrand: "Technogym" });
assertRuntimeSuccess(r);
assert(r.payload.version === BRAND_STRATEGY_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.selectedStrategy.strategyType === "premium", "premium strategy");
console.log(`PASS — ${r.summary}`);
