import {
  BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION,
  runBidderProposalDashboardRuntime,
  validateBidderProposalDashboardRuntime,
  buildBidderProposalComposerEvidence,
  buildBidderProposalComposerReport,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-bidder-proposal-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateBidderProposalDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runBidderProposalDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.proposalDifferentiationScore >= 85, "differentiation >= 85%");
const evidence = buildBidderProposalComposerEvidence({ deploymentId: ID });
assert(evidence.domains.length === 9, "nine domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildBidderProposalComposerReport({ deploymentId: ID });
assert(report.proposalDifferentiationScore >= 85, "report differentiation");
assert(report.proposalSummaries.length === 4, "four proposals");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
