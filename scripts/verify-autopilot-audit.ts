import {
  AUTOPILOT_AUDIT_RUNTIME_VERSION,
  runAutopilotAuditRuntime,
  validateAutopilotAuditRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-autopilot-audit-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAutopilotAuditRuntime({ deploymentId: ID }).valid, "validation");
const r = runAutopilotAuditRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AUTOPILOT_AUDIT_RUNTIME_VERSION, "version");
assert(r.payload.records.length === 8, "audit records");
assert(r.payload.totalCostUsd > 0, "cost tracked");
console.log(`PASS — ${r.summary}`);
