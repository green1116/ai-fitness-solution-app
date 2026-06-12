import {
  TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION,
  runTenderResponseDashboardRuntime,
  validateTenderResponseDashboardRuntime,
  buildTenderResponsePackEvidence,
  buildTenderResponsePackReport,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-tender-response-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTenderResponseDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runTenderResponseDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.metrics.submissionReadiness >= 95, "submission readiness >= 95%");
assert(r.payload.tenderResponseReadiness >= 90, "tender response readiness");
const evidence = buildTenderResponsePackEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildTenderResponsePackReport({ deploymentId: ID });
assert(report.submissionReadiness >= 95, "report submission readiness");
assert(report.responsePacks.length === 4, "four response packs");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
