import {
  EQUIPMENT_REQUIREMENT_RUNTIME_VERSION,
  runEquipmentRequirementRuntime,
  validateEquipmentRequirementRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-equipment-requirement-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentRequirementRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentRequirementRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_REQUIREMENT_RUNTIME_VERSION, "version");
assert(r.payload.profile.totalMinQuantity >= 8, "min quantity");
console.log(`PASS — ${r.summary}`);
