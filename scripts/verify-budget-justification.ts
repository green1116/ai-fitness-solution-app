import {
  BUDGET_JUSTIFICATION_RUNTIME_VERSION,
  runBudgetJustificationRuntime,
  validateBudgetJustificationRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-budget-justification-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetJustificationRuntime({ deploymentId: ID }).valid, "validation");
const r = runBudgetJustificationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_JUSTIFICATION_RUNTIME_VERSION, "version");
assert(r.payload.profile.budgetAlignmentScore >= 70, "budget alignment");
console.log(`PASS — ${r.summary}`);
