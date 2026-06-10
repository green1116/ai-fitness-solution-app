import {
  RISK_ANALYSIS_RUNTIME_VERSION,
  runRiskAnalysisRuntime,
  validateRiskAnalysisRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-risk-analysis-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRiskAnalysisRuntime({ deploymentId: ID }).valid, "validation");
const r = runRiskAnalysisRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RISK_ANALYSIS_RUNTIME_VERSION, "version");
assert(r.payload.riskRegister.length >= 4, "risks");
assert(r.payload.mitigationStrategies.length === r.payload.riskRegister.length, "mitigations");
console.log(`PASS — ${r.summary}`);
