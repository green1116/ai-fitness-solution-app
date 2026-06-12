import {
  PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION,
  runProposalDifferentiationRuntime,
  validateProposalDifferentiationRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-differentiation";

const ID = "v192-proposal-differentiation-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalDifferentiationRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalDifferentiationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION, "version");
assert(r.payload.allVariants.length === 4, "four variants");
assert(r.payload.allVariants.some((v) => v.proposalLabel === "Proposal A" && v.bidderBrand === "Technogym"), "proposal A");
assert(r.payload.allVariants.some((v) => v.proposalLabel === "Proposal D" && v.bidderBrand === "Shuhua"), "proposal D");
const scores = r.payload.allVariants.map((v) => v.differentiationScore);
assert(new Set(scores).size >= 3, "distinct scores");
console.log(`PASS — ${r.summary}`);
