import {
  COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION,
  runCompetitiveNarrativeComposerRuntime,
  validateCompetitiveNarrativeComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-competitive-narrative-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCompetitiveNarrativeComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runCompetitiveNarrativeComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.differentiationReadiness > 0, "differentiation readiness");
console.log(`PASS — ${r.summary}`);
