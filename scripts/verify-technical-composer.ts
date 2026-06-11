import {
  TECHNICAL_COMPOSER_RUNTIME_VERSION,
  runTechnicalComposerRuntime,
  validateTechnicalComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-technical-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTechnicalComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runTechnicalComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TECHNICAL_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.composition.technicalReadiness > 0, "technical readiness");
console.log(`PASS — ${r.summary}`);
