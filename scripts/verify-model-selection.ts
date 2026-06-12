import {
  MODEL_SELECTION_RUNTIME_VERSION,
  runModelSelectionRuntime,
  validateModelSelectionRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-model-selection-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateModelSelectionRuntime({ deploymentId: ID, bidderBrand: "Shuhua" }).valid, "validation");
const r = runModelSelectionRuntime({ deploymentId: ID, bidderBrand: "Shuhua" });
assertRuntimeSuccess(r);
assert(r.payload.version === MODEL_SELECTION_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.routeType === "value", "value route");
console.log(`PASS — ${r.summary}`);
