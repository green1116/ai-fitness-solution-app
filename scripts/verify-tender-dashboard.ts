import {
  TENDER_DASHBOARD_RUNTIME_VERSION,
  runTenderDashboardRuntime,
  validateTenderDashboardRuntime,
  buildTenderIntelligenceEvidence,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-tender-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTenderDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runTenderDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TENDER_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.intelligenceCompleteness === 100, "completeness");
const evidence = buildTenderIntelligenceEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
