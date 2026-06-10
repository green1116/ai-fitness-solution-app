import {
  AUTOPILOT_DASHBOARD_RUNTIME_VERSION,
  runAutopilotDashboardRuntime,
  validateAutopilotDashboardRuntime,
  buildAutopilotEvidence,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-autopilot-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAutopilotDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runAutopilotDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AUTOPILOT_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.deliveryReadiness === 100, "delivery readiness");
const evidence = buildAutopilotEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
