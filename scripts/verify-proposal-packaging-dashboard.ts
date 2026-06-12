import {
  PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION,
  runProposalPackagingDashboardRuntime,
  validateProposalPackagingDashboardRuntime,
  buildProposalDeliveryPackagingEvidence,
  buildProposalDeliveryPackagingReport,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-proposal-packaging-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalPackagingDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalPackagingDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.budgetAlignmentScore >= 85, "budget alignment >= 85%");
assert(r.payload.deliveryReadinessScore >= 90, "delivery readiness >= 90%");
const evidence = buildProposalDeliveryPackagingEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
const report = buildProposalDeliveryPackagingReport({ deploymentId: ID });
assert(report.budgetAlignmentScore >= 85, "report budget alignment");
assert(report.deliveryReadinessScore >= 90, "report delivery readiness");
assert(report.lifecycleCostProfiles.length === 4, "four lifecycle profiles");
console.log(`PASS — ${r.summary}`);
console.log(`REPORT — ${report.summary}`);
