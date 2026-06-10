import {
  PROJECT_KNOWLEDGE_RUNTIME_VERSION,
  GYM_PROJECT_TYPES,
  runProjectKnowledgeRuntime,
  validateProjectKnowledgeRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-project-knowledge-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProjectKnowledgeRuntime({ deploymentId: ID }).valid, "validation");
const r = runProjectKnowledgeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROJECT_KNOWLEDGE_RUNTIME_VERSION, "version");
assert(r.payload.assetCount === GYM_PROJECT_TYPES.length, "five types");
console.log(`PASS — ${r.summary}`);
