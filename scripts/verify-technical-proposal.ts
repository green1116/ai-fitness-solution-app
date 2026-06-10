import {
  TECHNICAL_PROPOSAL_RUNTIME_VERSION,
  runTechnicalProposalRuntime,
  validateTechnicalProposalRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-technical-proposal-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateTechnicalProposalRuntime({ deploymentId: ID }).valid, "validation");
const r = runTechnicalProposalRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === TECHNICAL_PROPOSAL_RUNTIME_VERSION, "version");
assert(r.payload.technicalScope.length >= 3, "scope");
assert(r.payload.solutionArchitecture.length >= 3, "architecture");
console.log(`PASS — ${r.summary}`);
