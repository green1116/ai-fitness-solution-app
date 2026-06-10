import {
  AI_KNOWLEDGE_FUSION_RUNTIME_VERSION,
  runAiKnowledgeFusionRuntime,
  validateAiKnowledgeFusionRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-ai-knowledge-fusion-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiKnowledgeFusionRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiKnowledgeFusionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_KNOWLEDGE_FUSION_RUNTIME_VERSION, "version");
assert(r.payload.proposalContext.knowledgeRefs.length > 0, "knowledge refs");
assert(r.payload.tenderContext.projectType.length > 0, "tender context");
console.log(`PASS — ${r.summary}`);
