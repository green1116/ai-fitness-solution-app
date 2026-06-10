import {
  OUTREACH_RUNTIME_VERSION,
  OUTREACH_CHANNELS,
  runOutreachRuntime,
  validateOutreachRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-outreach-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateOutreachRuntime({ deploymentId: ID }).valid, "validation");
const r = runOutreachRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === OUTREACH_RUNTIME_VERSION, "version");
assert(r.payload.records.length >= 4, "records");
assert(OUTREACH_CHANNELS.length === 4, "channels");
console.log(`PASS — ${r.summary}`);
