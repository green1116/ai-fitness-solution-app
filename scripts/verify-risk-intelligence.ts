import {
  RISK_INTELLIGENCE_RUNTIME_VERSION,
  runRiskIntelligenceRuntime,
  validateRiskIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-risk-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRiskIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runRiskIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RISK_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.risk.drivers.length >= 3, "drivers");
console.log(`PASS — ${r.summary}`);
