import {
  PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION,
  runProposalDeliveryPackageRuntime,
  validateProposalDeliveryPackageRuntime,
  assertRuntimeSuccess,
} from "../lib/proposal-delivery-packaging";

const ID = "v195-proposal-delivery-package-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateProposalDeliveryPackageRuntime({ deploymentId: ID }).valid, "validation");
const r = runProposalDeliveryPackageRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION, "version");
assert(r.payload.packageCount === 4, "four packages");
console.log(`PASS — ${r.summary}`);
