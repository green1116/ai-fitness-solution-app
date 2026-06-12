import {
  PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION,
  runProposalVariantComposerRuntime,
  validateProposalVariantComposerRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-proposal-composer";

const ID = "v194-proposal-variant-composer-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalVariantComposerRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalVariantComposerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION, "version");
assert(r.payload.variantCount === 4, "four variants");
assert(r.payload.variantSpreadScore > 20, "variant spread");
console.log(`PASS — ${r.summary}`);
