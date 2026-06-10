import {
  COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION,
  runComplianceIntelligenceRuntime,
  validateComplianceIntelligenceRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-intelligence";

const ID = "v12-compliance-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateComplianceIntelligenceRuntime({ deploymentId: ID }).valid, "validation");
const r = runComplianceIntelligenceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPLIANCE_INTELLIGENCE_RUNTIME_VERSION, "version");
assert(r.payload.compliance.complianceCoverage > 0, "coverage");
console.log(`PASS — ${r.summary}`);
