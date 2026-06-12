import {
  COMPATIBILITY_RUNTIME_VERSION,
  runCompatibilityRuntime,
  validateCompatibilityRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-compatibility-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCompatibilityRuntime({ deploymentId: ID }).valid, "validation");
const r = runCompatibilityRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPATIBILITY_RUNTIME_VERSION, "version");
assert(r.payload.compatibilityScore > 0, "compatibility score");
console.log(`PASS — ${r.summary}`);
