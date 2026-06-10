import {
  APPROVAL_RUNTIME_VERSION,
  runApprovalRuntime,
  validateApprovalRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-approval-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateApprovalRuntime({ deploymentId: ID }).valid, "validation");
const r = runApprovalRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === APPROVAL_RUNTIME_VERSION, "version");
assert(r.payload.currentStatus === "review", "status");
assert(r.payload.records.length === 4, "records");
console.log(`PASS — ${r.summary}`);
