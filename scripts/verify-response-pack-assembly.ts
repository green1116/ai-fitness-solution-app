import {
  RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION,
  runResponsePackAssemblyRuntime,
  validateResponsePackAssemblyRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-response-pack-assembly-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateResponsePackAssemblyRuntime({ deploymentId: ID }).valid, "validation");
const r = runResponsePackAssemblyRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RESPONSE_PACK_ASSEMBLY_RUNTIME_VERSION, "version");
assert(r.payload.assemblyReadiness >= 85, "assembly readiness");
console.log(`PASS — ${r.summary}`);
