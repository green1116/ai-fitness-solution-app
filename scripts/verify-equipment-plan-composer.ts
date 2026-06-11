import {
  EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION,
  runEquipmentPlanComposerRuntime,
  validateEquipmentPlanComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-equipment-plan-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentPlanComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentPlanComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_PLAN_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.composition.equipmentPlanReadiness > 0, "equipment plan readiness");
console.log(`PASS — ${r.summary}`);
