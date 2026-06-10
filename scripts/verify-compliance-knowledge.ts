import {
  COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION,
  COMPLIANCE_DOMAINS,
  runComplianceKnowledgeRuntime,
  validateComplianceKnowledgeRuntime,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-compliance-knowledge-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateComplianceKnowledgeRuntime({ deploymentId: ID }).valid, "validation");
const r = runComplianceKnowledgeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPLIANCE_KNOWLEDGE_RUNTIME_VERSION, "version");
assert(r.payload.assetCount === COMPLIANCE_DOMAINS.length, "domains");
console.log(`PASS — ${r.summary}`);
