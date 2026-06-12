import {
  MAINTENANCE_NARRATIVE_RUNTIME_VERSION,
  runMaintenanceNarrativeRuntime,
  validateMaintenanceNarrativeRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-maintenance-narrative-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateMaintenanceNarrativeRuntime({ deploymentId: ID }).valid, "validation");
const r = runMaintenanceNarrativeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === MAINTENANCE_NARRATIVE_RUNTIME_VERSION, "version");
assert(r.payload.narrative.supportReadiness >= 80, "support readiness");
console.log(`PASS — ${r.summary}`);
