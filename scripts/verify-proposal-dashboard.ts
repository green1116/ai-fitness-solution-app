import {
  PROPOSAL_DASHBOARD_RUNTIME_VERSION,
  runProposalDashboardRuntime,
  validateProposalDashboardRuntime,
  buildProposalGenerationEvidence,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-proposal-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.sectionCount === 6, "sections");
assert(r.payload.proposalCompleteness > 0, "completeness");
assert(r.payload.riskCoverage === 100, "risk coverage");
const evidence = buildProposalGenerationEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
