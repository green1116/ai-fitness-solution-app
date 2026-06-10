import {
  EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION,
  runEquipmentIntelligenceRuntime,
  validateEquipmentIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-equipment-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.equipment.zones.length >= 3, "zones");
console.log(`PASS — ${r.summary}`);
