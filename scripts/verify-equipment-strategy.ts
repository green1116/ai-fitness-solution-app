import {
  EQUIPMENT_STRATEGY_RUNTIME_VERSION,
  runEquipmentStrategyRuntime,
  validateEquipmentStrategyRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-equipment-strategy-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentStrategyRuntime({ deploymentId: ID, bidderBrand: "Matrix" }).valid, "validation");
const r = runEquipmentStrategyRuntime({ deploymentId: ID, bidderBrand: "Matrix" });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_STRATEGY_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.preferredEquipmentSet.length >= 1, "preferred set");
console.log(`PASS — ${r.summary}`);
