import {
  ENTERPRISE_DASHBOARD_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  runEnterpriseDashboardRuntime,
  validateEnterpriseDashboardRuntime,
  buildEnterpriseSaasEvidence,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-enterprise-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateEnterpriseDashboardRuntime({ deploymentId: ID });
assert(v.summariesValid, "validation");
const r = runEnterpriseDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === ENTERPRISE_DASHBOARD_RUNTIME_VERSION, "dashboard version");
assert(r.payload.tenantSummary.tenantId.length > 0, "tenant summary");
assert(r.payload.seatSummary.licensedSeats > 0, "seat summary");
assert(r.payload.usageSummary.plans > 0, "usage summary");
const evidence = buildEnterpriseSaasEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
