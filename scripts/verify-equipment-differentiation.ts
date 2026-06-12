import {
  EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION,
  runEquipmentDifferentiationRuntime,
  validateEquipmentDifferentiationRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-equipment-differentiation-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentDifferentiationRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentDifferentiationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_DIFFERENTIATION_RUNTIME_VERSION, "version");
assert(r.payload.equipmentDifferentiationScore >= 80, "differentiation >= 80%");
assert(r.payload.snapshot.comparisons.length === 4, "four proposals");
console.log(`PASS — ${r.summary}`);
