import {
  EQUIPMENT_CATALOG_RUNTIME_VERSION,
  runEquipmentCatalogRuntime,
  validateEquipmentCatalogRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-equipment-catalog-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentCatalogRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentCatalogRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_CATALOG_RUNTIME_VERSION, "version");
assert(r.payload.catalogReadiness > 0, "readiness");
assert(r.payload.snapshot.models.length >= 4, "models");
console.log(`PASS — ${r.summary}`);
