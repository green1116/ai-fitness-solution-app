import {
  PROPOSAL_SECTION_RUNTIME_VERSION,
  PROPOSAL_SECTION_KINDS,
  runProposalSectionRuntime,
  validateProposalSectionRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-pdf";

const ID = "v112-proposal-section-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalSectionRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalSectionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_SECTION_RUNTIME_VERSION, "section version");
assert(r.payload.sections.length === PROPOSAL_SECTION_KINDS.length, "six sections");
for (const kind of PROPOSAL_SECTION_KINDS) {
  assert(r.payload.sections.some((s) => s.kind === kind), kind);
}
console.log(`PASS — ${r.summary}`);
