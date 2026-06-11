import {
  BUDGET_PACKAGE_RUNTIME_VERSION,
  runBudgetPackageRuntime,
  validateBudgetPackageRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-budget-package-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetPackageRuntime({ deploymentId: ID }).valid, "validation");
const r = runBudgetPackageRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_PACKAGE_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.premiumBudgetPackage.totalBudgetMin > r.payload.snapshot.valueBudgetPackage.totalBudgetMin, "premium > value");
console.log(`PASS — ${r.summary}`);
