import {
  RENEWAL_RISK_RUNTIME_VERSION,
  RENEWAL_RISK_LEVELS,
  runRenewalRiskRuntime,
  validateRenewalRiskRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-renewal-risk-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateRenewalRiskRuntime({ deploymentId: ID }).valid, "validation");
const r = runRenewalRiskRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === RENEWAL_RISK_RUNTIME_VERSION, "version");
assert(r.payload.highRiskCount > 0, "high risk");
assert(RENEWAL_RISK_LEVELS.includes(r.payload.records[0].riskLevel), "level");
console.log(`PASS — ${r.summary}`);
