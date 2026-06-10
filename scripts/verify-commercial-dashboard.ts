import {
  COMMERCIAL_DASHBOARD_RUNTIME_VERSION,
  runCommercialDashboardRuntime,
  validateCommercialDashboardRuntime,
  buildCommercialDeliveryEvidence,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-commercial-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCommercialDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runCommercialDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMMERCIAL_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.activeProjects > 0, "active projects");
const evidence = buildCommercialDeliveryEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
