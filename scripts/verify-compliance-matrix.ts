import {
  COMPLIANCE_MATRIX_RUNTIME_VERSION,
  runComplianceMatrixRuntime,
  validateComplianceMatrixRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-generation";

const ID = "v11-compliance-matrix-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateComplianceMatrixRuntime({ deploymentId: ID }).valid, "validation");
const r = runComplianceMatrixRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPLIANCE_MATRIX_RUNTIME_VERSION, "version");
assert(r.payload.requirementMappings.length >= 4, "mappings");
assert(r.payload.evidenceMappings.length === r.payload.requirementMappings.length, "evidence");
console.log(`PASS — ${r.summary}`);
