import {
  SEAT_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  runSeatRuntime,
  validateSeatRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-seat-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateSeatRuntime({ deploymentId: ID });
assert(v.allocationValid, "validation");
const r = runSeatRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.allocation.availableSeats === r.payload.allocation.licensedSeats - r.payload.allocation.activeSeats, "available seats");
console.log(`PASS — ${r.summary}`);
