import {
  ROI_NARRATIVE_RUNTIME_VERSION,
  runROINarrativeRuntime,
  validateROINarrativeRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-roi-narrative-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateROINarrativeRuntime({ deploymentId: ID }).valid, "validation");
const r = runROINarrativeRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === ROI_NARRATIVE_RUNTIME_VERSION, "version");
assert(r.payload.roiReadiness >= 70, "roi readiness");
console.log(`PASS — ${r.summary}`);
