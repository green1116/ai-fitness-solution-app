import {
  BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION,
  runBudgetNarrativeComposerRuntime,
  validateBudgetNarrativeComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-budget-narrative-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBudgetNarrativeComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runBudgetNarrativeComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.budgetReadiness > 0, "budget readiness");
console.log(`PASS — ${r.summary}`);
