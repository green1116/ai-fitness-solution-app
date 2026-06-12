import {
  COMMERCIAL_ATTACHMENT_RUNTIME_VERSION,
  runCommercialAttachmentRuntime,
  validateCommercialAttachmentRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-commercial-attachment-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCommercialAttachmentRuntime({ deploymentId: ID }).valid, "validation");
const r = runCommercialAttachmentRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === COMMERCIAL_ATTACHMENT_RUNTIME_VERSION, "version");
assert(r.payload.commercialReadiness >= 80, "commercial readiness");
console.log(`PASS — ${r.summary}`);
