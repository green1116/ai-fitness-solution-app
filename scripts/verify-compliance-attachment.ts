import {
  COMPLIANCE_ATTACHMENT_RUNTIME_VERSION,
  runComplianceAttachmentRuntime,
  validateComplianceAttachmentRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-compliance-attachment-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateComplianceAttachmentRuntime({ deploymentId: ID }).valid, "validation");
const r = runComplianceAttachmentRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMPLIANCE_ATTACHMENT_RUNTIME_VERSION, "version");
assert(r.payload.complianceReadiness >= 80, "compliance readiness");
console.log(`PASS — ${r.summary}`);
