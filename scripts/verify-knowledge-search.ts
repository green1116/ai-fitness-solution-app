import {
  KNOWLEDGE_SEARCH_RUNTIME_VERSION,
  runKnowledgeSearchRuntime,
  validateKnowledgeSearchRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-knowledge-search-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateKnowledgeSearchRuntime({ deploymentId: ID }).valid, "validation");
const r = runKnowledgeSearchRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === KNOWLEDGE_SEARCH_RUNTIME_VERSION, "version");
assert(r.payload.keywordSearch.hitCount > 0, "keyword hits");
assert(r.payload.categorySearch.hitCount > 0, "category hits");
assert(r.payload.profileSearch.searchReady, "profile ready");
console.log(`PASS — ${r.summary}`);
