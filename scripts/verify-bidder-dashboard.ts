import {
  BIDDER_DASHBOARD_RUNTIME_VERSION,
  runBidderDashboardRuntime,
  validateBidderDashboardRuntime,
  buildBidderIntelligenceEvidence,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-bidder-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBidderDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runBidderDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BIDDER_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.bidderReadiness > 0, "bidder readiness");
assert(r.payload.brandReadiness > 0, "brand readiness");
assert(r.payload.catalogReadiness > 0, "catalog readiness");
assert(r.payload.proposalDifferentiationReadiness > 0, "differentiation readiness");
const evidence = buildBidderIntelligenceEvidence({ deploymentId: ID });
assert(evidence.domains.length === 6, "six domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
