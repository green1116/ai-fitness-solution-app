import {
  RESPONSE_PACK_CONTEXT_RUNTIME_VERSION,
  runResponsePackContextRuntime,
  validateResponsePackContextRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-response-pack-context-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateResponsePackContextRuntime({ deploymentId: ID }).valid, "validation");
const r = runResponsePackContextRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RESPONSE_PACK_CONTEXT_RUNTIME_VERSION, "version");
assert(r.payload.contextReadiness >= 80, "context readiness");
console.log(`PASS — ${r.summary}`);
