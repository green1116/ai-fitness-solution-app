import {
  VARIANT_PACK_RUNTIME_VERSION,
  runVariantPackRuntime,
  validateVariantPackRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-variant-pack-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateVariantPackRuntime({ deploymentId: ID }).valid, "validation");
const r = runVariantPackRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === VARIANT_PACK_RUNTIME_VERSION, "version");
assert(r.payload.variantCount === 4, "four variants");
console.log(`PASS — ${r.summary}`);
