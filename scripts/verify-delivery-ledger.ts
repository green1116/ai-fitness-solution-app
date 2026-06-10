import {
  DELIVERY_LEDGER_RUNTIME_VERSION,
  LEDGER_EVENT_TYPES,
  runDeliveryLedgerRuntime,
  validateDeliveryLedgerRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-delivery-ledger-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDeliveryLedgerRuntime({ deploymentId: ID }).valid, "validation");
const r = runDeliveryLedgerRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DELIVERY_LEDGER_RUNTIME_VERSION, "version");
assert(r.payload.ledger.eventCount === LEDGER_EVENT_TYPES.length, "events");
console.log(`PASS — ${r.summary}`);
