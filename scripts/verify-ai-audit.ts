import {
  AI_AUDIT_RUNTIME_VERSION,
  runAiAuditRuntime,
  validateAiAuditRuntime,
  assertRuntimeSuccess,
} from "../lib/ai-integration";

const ID = "v13-ai-audit-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateAiAuditRuntime({ deploymentId: ID }).valid, "validation");
const r = runAiAuditRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === AI_AUDIT_RUNTIME_VERSION, "version");
assert(r.payload.recordCount === 5, "five records");
assert(r.payload.records.every((rec) => rec.promptVersion.length > 0), "prompt version");
console.log(`PASS — ${r.summary}`);
