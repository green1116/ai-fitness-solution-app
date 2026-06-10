import {
  PROPOSAL_COVER_RUNTIME_VERSION,
  PROPOSAL_PDF_VERSION,
  runProposalCoverRuntime,
  validateProposalCoverRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-pdf";

const ID = "v112-proposal-cover-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalCoverRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalCoverRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.version === PROPOSAL_PDF_VERSION, "pdf version");
assert(r.payload.version === PROPOSAL_COVER_RUNTIME_VERSION, "cover version");
assert(r.payload.cover.projectName.length > 0, "project name");
assert(r.payload.cover.customerName.length > 0, "customer name");
console.log(`PASS — ${r.summary}`);
