import {
  PROJECT_CLASSIFICATION_RUNTIME_VERSION,
  TENDER_INTELLIGENCE_VERSION,
  GYM_PROJECT_TYPES,
  runProjectClassificationRuntime,
  validateProjectClassificationRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-classification-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProjectClassificationRuntime({ deploymentId: ID }).valid, "validation");
const r = runProjectClassificationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROJECT_CLASSIFICATION_RUNTIME_VERSION, "version");
assert(r.version === TENDER_INTELLIGENCE_VERSION, "intel version");
assert(r.payload.supportedTypes.length === GYM_PROJECT_TYPES.length, "five types");
console.log(`PASS — ${r.summary}`);
