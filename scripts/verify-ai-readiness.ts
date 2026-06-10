import {
  AI_READINESS_DASHBOARD_RUNTIME_VERSION,
  runAiReadinessDashboardRuntime,
  validateAiReadinessDashboard,
  buildAiReadinessEvidence,
  assertRuntimeSuccess,
} from "../lib/ai-readiness";

const ID = "v115-ai-readiness-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiReadinessDashboard({ deploymentId: ID }).valid, "validation");
const r = runAiReadinessDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_READINESS_DASHBOARD_RUNTIME_VERSION, "dashboard version");
assert(r.payload.dimensions.length === 5, "five dimensions");
assert(r.payload.overallScore > 0, "overall score");
const evidence = buildAiReadinessEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
