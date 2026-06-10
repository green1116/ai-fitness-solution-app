import {
  CAMPAIGN_RUNTIME_VERSION,
  runCampaignRuntime,
  validateCampaignRuntime,
  assertRuntimeSuccess,
} from "../lib/go-to-market";

const ID = "v17-campaign-runtime-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateCampaignRuntime({ deploymentId: ID }).valid, "validation");
const r = runCampaignRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === CAMPAIGN_RUNTIME_VERSION, "version");
assert(r.payload.campaigns.length >= 3, "campaigns");
console.log(`PASS — ${r.summary}`);
