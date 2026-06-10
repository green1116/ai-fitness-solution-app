import {
  PROPOSAL_TOC_RUNTIME_VERSION,
  runProposalTocRuntime,
  validateProposalTocRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-pdf";

const ID = "v112-proposal-toc-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalTocRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalTocRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_TOC_RUNTIME_VERSION, "toc version");
assert(r.payload.tableOfContents.length >= 6, "toc entries");
assert(r.payload.sectionIndex.length === r.payload.tableOfContents.length, "index");
console.log(`PASS — ${r.summary}`);
