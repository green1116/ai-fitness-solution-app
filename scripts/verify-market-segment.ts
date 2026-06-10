import {
  MARKET_SEGMENT_RUNTIME_VERSION,
  SEGMENT_TYPES,
  runMarketSegmentRuntime,
  validateMarketSegmentRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-market-segment-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateMarketSegmentRuntime({ deploymentId: ID }).valid, "validation");
const r = runMarketSegmentRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === MARKET_SEGMENT_RUNTIME_VERSION, "version");
assert(r.payload.segments.length === SEGMENT_TYPES.length, "segments");
console.log(`PASS — ${r.summary}`);
