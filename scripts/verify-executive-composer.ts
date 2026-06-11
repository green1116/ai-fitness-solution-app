import {
  EXECUTIVE_COMPOSER_RUNTIME_VERSION,
  runExecutiveComposerRuntime,
  validateExecutiveComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-executive-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateExecutiveComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runExecutiveComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EXECUTIVE_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.executiveReadiness > 0, "executive readiness");
console.log(`PASS — ${r.summary}`);
