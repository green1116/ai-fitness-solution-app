import {
  AI_GENERATION_DASHBOARD_RUNTIME_VERSION,
  runAiGenerationDashboardRuntime,
  validateAiGenerationDashboardRuntime,
  buildAiIntegrationEvidence,
  generateWithGateway,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-ai-generation-dashboard-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiGenerationDashboardRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiGenerationDashboardRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_GENERATION_DASHBOARD_RUNTIME_VERSION, "version");
assert(r.payload.generationReadiness === 100, "generation readiness");
const gateway = generateWithGateway({
  deploymentId: ID,
  prompt: "政府健身中心方案",
  method: "proposal",
  forceMode: "stub",
});
assert(gateway.safetyPassed, "gateway safety");
const evidence = buildAiIntegrationEvidence({ deploymentId: ID });
assert(evidence.domains.length === 8, "eight domains");
assert(evidence.runtimes.every((rt) => rt.status === "success"), "all success");
console.log(`PASS — ${r.summary}`);
