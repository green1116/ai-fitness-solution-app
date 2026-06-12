import {
  EQUIPMENT_PACKAGE_RUNTIME_VERSION,
  runEquipmentPackageRuntime,
  validateEquipmentPackageRuntime,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-equipment-package-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentPackageRuntime({ deploymentId: ID, bidderBrand: "Life Fitness" }).valid, "validation");
const r = runEquipmentPackageRuntime({ deploymentId: ID, bidderBrand: "Life Fitness" });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_PACKAGE_RUNTIME_VERSION, "version");
assert(r.payload.snapshot.selectedPackage.packageLabel.includes("Reliability"), "reliability package");
console.log(`PASS — ${r.summary}`);
