import {
  BUDGET_MAPPING_RUNTIME_VERSION,
  runBudgetMappingRuntime,
  validateBudgetMappingRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-budget-mapping-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetMappingRuntime({ deploymentId: ID }).valid, "validation");
const r = runBudgetMappingRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_MAPPING_RUNTIME_VERSION, "version");
assert(r.payload.budgetMappingReadiness > 0, "readiness");
assert(r.payload.snapshot.lowBudgetProfile.equipmentItems.length >= 2, "low budget");
assert(r.payload.snapshot.premiumBudgetProfile.equipmentItems.length >= 2, "premium budget");
console.log(`PASS — ${r.summary}`);
