import {
  GTM_DASHBOARD_RUNTIME_VERSION,
  runGtmDashboardRuntime,
  validateGtmDashboardRuntime,
  buildGtmEvidence,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-gtm-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateGtmDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runGtmDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === GTM_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.goToMarketReadiness > 0, "readiness");
const evidence = buildGtmEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
