import {
  EQUIPMENT_MATCHING_RUNTIME_VERSION,
  runEquipmentMatchingRuntime,
  validateEquipmentMatchingRuntime,
  assertRuntimeSuccess,
} from "../lib/brand-catalog-intelligence";

const ID = "v191-equipment-matching-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentMatchingRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentMatchingRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_MATCHING_RUNTIME_VERSION, "version");
assert(r.payload.matchingReadiness > 0, "readiness");
assert(r.payload.snapshot.preferredOptions.length >= 2, "preferred");
console.log(`PASS — ${r.summary}`);
