import {
  RISK_KNOWLEDGE_RUNTIME_VERSION,
  RISK_CATEGORIES,
  runRiskKnowledgeRuntime,
  validateRiskKnowledgeRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-risk-knowledge-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRiskKnowledgeRuntime({ deploymentId: ID }).valid, "validation");
const r = runRiskKnowledgeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RISK_KNOWLEDGE_RUNTIME_VERSION, "version");
assert(r.payload.assetCount === RISK_CATEGORIES.length, "categories");
console.log(`PASS — ${r.summary}`);
