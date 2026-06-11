import {
  EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION,
  runEquipmentIntelligenceRuntime,
  validateEquipmentIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-equipment-intelligence-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.equipmentReadiness > 0, "readiness");
assert(r.payload.snapshot.profiles.length >= 8, "profiles");
console.log(`PASS — ${r.summary}`);
