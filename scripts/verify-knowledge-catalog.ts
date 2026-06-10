import {
  KNOWLEDGE_CATALOG_RUNTIME_VERSION,
  KNOWLEDGE_CATALOG_CATEGORIES,
  runKnowledgeCatalogRuntime,
  validateKnowledgeCatalogRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-knowledge-catalog-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateKnowledgeCatalogRuntime({ deploymentId: ID }).valid, "validation");
const r = runKnowledgeCatalogRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === KNOWLEDGE_CATALOG_RUNTIME_VERSION, "version");
assert(r.payload.catalog.entries.length === KNOWLEDGE_CATALOG_CATEGORIES.length, "entries");
console.log(`PASS — ${r.summary}`);
