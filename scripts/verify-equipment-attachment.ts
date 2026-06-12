import {
  EQUIPMENT_ATTACHMENT_RUNTIME_VERSION,
  runEquipmentAttachmentRuntime,
  validateEquipmentAttachmentRuntime,
  assertRuntimeSuccess,
} from "../lib/tender-response-pack";

const ID = "v196-equipment-attachment-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateEquipmentAttachmentRuntime({ deploymentId: ID }).valid, "validation");
const r = runEquipmentAttachmentRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === EQUIPMENT_ATTACHMENT_RUNTIME_VERSION, "version");
assert(r.payload.attachmentReadiness >= 80, "attachment readiness");
console.log(`PASS — ${r.summary}`);
