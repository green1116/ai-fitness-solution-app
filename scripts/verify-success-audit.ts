import {
  SUCCESS_AUDIT_RUNTIME_VERSION,
  runSuccessAuditRuntime,
  validateSuccessAuditRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-success-audit-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateSuccessAuditRuntime({ deploymentId: ID }).valid, "validation");
const r = runSuccessAuditRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === SUCCESS_AUDIT_RUNTIME_VERSION, "version");
assert(r.payload.customerActionCount > 0, "customer actions");
assert(r.payload.successActionCount > 0, "success actions");
console.log(`PASS — ${r.summary}`);
