import {
  EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION,
  runEquipmentSelectionDashboardRuntime,
  validateEquipmentSelectionDashboardRuntime,
  buildEquipmentSelectionEvidence,
  buildEquipmentSelectionReport,
  assertRuntimeSuccess,
} from "../lib/equipment-selection";

const ID = "v193-equipment-selection-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentSelectionDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentSelectionDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_SELECTION_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.equipmentDifferentiationScore >= 80, "differentiation >= 80%");
const evidence = buildEquipmentSelectionEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildEquipmentSelectionReport({ deploymentId: ID });
assert(report.equipmentDifferentiationScore >= 80, "report differentiation");
assert(report.packages.length === 4, "four packages");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
