import {
  EXPANSION_RUNTIME_VERSION,
  EXPANSION_TYPES,
  runExpansionRuntime,
  validateExpansionRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-expansion-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateExpansionRuntime({ deploymentId: ID }).valid, "validation");
const r = runExpansionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EXPANSION_RUNTIME_VERSION, "version");
assert(r.payload.opportunities.length >= 2, "opportunities");
assert(EXPANSION_TYPES.includes(r.payload.opportunities[0].type), "type");
console.log(`PASS — ${r.summary}`);
