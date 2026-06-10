import {
  VERSION_RUNTIME_VERSION,
  runVersionRuntime,
  validateVersionRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-version-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateVersionRuntime({ deploymentId: ID }).valid, "validation");
const r = runVersionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === VERSION_RUNTIME_VERSION, "version");
assert(r.payload.currentVersion.isCurrent, "current");
assert(r.payload.versionHistory.length >= 2, "history");
console.log(`PASS — ${r.summary}`);
