import {
  DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION,
  runDifferentiationDashboardRuntime,
  validateDifferentiationDashboardRuntime,
  buildProposalDifferentiationEvidence,
  buildProposalDifferentiationReport,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-differentiation-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDifferentiationDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runDifferentiationDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.differentiationScore > 0, "differentiation score");
assert(r.payload.variantScores.length === 4, "four variants");
const evidence = buildProposalDifferentiationEvidence({ deploymentId: ID });
assert(evidence.domains.length === 7, "seven domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildProposalDifferentiationReport({ deploymentId: ID });
assert(report.brandDifferentiation > 0, "brand differentiation");
assert(report.budgetDifferentiation > 0, "budget differentiation");
assert(report.equipmentDifferentiation > 0, "equipment differentiation");
assert(report.proposalDifferentiationScore > 0, "proposal score");
assert(report.proposalVariants.length === 4, "report variants");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
