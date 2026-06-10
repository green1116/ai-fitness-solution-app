import {
  PROPOSAL_KNOWLEDGE_RUNTIME_VERSION,
  PROPOSAL_TEMPLATE_TYPES,
  runProposalKnowledgeRuntime,
  validateProposalKnowledgeRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-proposal-knowledge-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalKnowledgeRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalKnowledgeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_KNOWLEDGE_RUNTIME_VERSION, "version");
assert(r.payload.assetCount === PROPOSAL_TEMPLATE_TYPES.length, "templates");
console.log(`PASS — ${r.summary}`);
