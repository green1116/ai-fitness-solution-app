import {
  PROJECT_SCALE_RUNTIME_VERSION,
  PROJECT_SCALE_TIERS,
  runProjectScaleRuntime,
  validateProjectScaleRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-scale-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProjectScaleRuntime({ deploymentId: ID }).valid, "validation");
const r = runProjectScaleRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROJECT_SCALE_RUNTIME_VERSION, "version");
assert(PROJECT_SCALE_TIERS.includes(r.payload.scale.tier), "tier");
console.log(`PASS — ${r.summary}`);
