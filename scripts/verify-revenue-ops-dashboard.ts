import {
  REVENUE_OPS_DASHBOARD_RUNTIME_VERSION,
  runRevenueOpsDashboardRuntime,
  validateRevenueOpsDashboardRuntime,
  buildRevenueOperationsEvidence,
  assertRuntimeSuccess,
} from "../lib/revenue-operations";

const ID = "v15-revenue-ops-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRevenueOpsDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runRevenueOpsDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === REVENUE_OPS_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.pipelineHealth > 0, "pipeline health");
const evidence = buildRevenueOperationsEvidence({ deploymentId: ID });
assert(evidence.domains.length === 9, "nine domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
