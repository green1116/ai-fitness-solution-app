import {
  SUPPLIER_CAPABILITY_RUNTIME_VERSION,
  runSupplierCapabilityRuntime,
  validateSupplierCapabilityRuntime,
  assertRuntimeSuccess,
} from "../lib/bidder-intelligence";

const ID = "v19-supplier-capability-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateSupplierCapabilityRuntime({ deploymentId: ID }).valid, "validation");
const r = runSupplierCapabilityRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === SUPPLIER_CAPABILITY_RUNTIME_VERSION, "version");
assert(r.payload.supplierReadiness > 0, "readiness");
assert(r.payload.snapshot.deliveryCoverage.length >= 2, "delivery coverage");
console.log(`PASS — ${r.summary}`);
