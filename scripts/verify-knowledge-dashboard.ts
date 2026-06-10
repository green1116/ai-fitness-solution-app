import {
  KNOWLEDGE_DASHBOARD_RUNTIME_VERSION,
  runKnowledgeDashboardRuntime,
  validateKnowledgeDashboardRuntime,
  buildKnowledgeBaseEvidence,
  assertRuntimeSuccess,
} from "../lib/knowledge-base";

const ID = "v12.5-knowledge-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateKnowledgeDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runKnowledgeDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === KNOWLEDGE_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.knowledgeCompleteness === 100, "completeness");
assert(r.payload.searchReadiness === 100, "search readiness");
const evidence = buildKnowledgeBaseEvidence({ deploymentId: ID });
assert(evidence.domains.length === 9, "nine domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
