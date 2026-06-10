import {
  PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION,
  runProposalPdfDashboardRuntime,
  validateProposalPdfDashboardRuntime,
  buildProposalPdfEvidence,
  assertRuntimeSuccess,
} from "../lib/proposal-pdf";

const ID = "v112-proposal-pdf-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalPdfDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalPdfDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION, "dashboard version");
assert(r.payload.sectionCount === 6, "sections");
assert(r.payload.completeness === 100, "completeness");
assert(r.payload.renderReadiness === "delivery-ready", "readiness");
const evidence = buildProposalPdfEvidence({ deploymentId: ID });
assert(evidence.domains.length === 5, "five domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
