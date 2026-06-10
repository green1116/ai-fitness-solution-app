import {
  DELIVERY_WORKSPACE_RUNTIME_VERSION,
  runDeliveryWorkspaceRuntime,
  validateDeliveryWorkspaceRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-delivery";

const ID = "v14-delivery-workspace-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateDeliveryWorkspaceRuntime({ deploymentId: ID }).valid, "validation");
const r = runDeliveryWorkspaceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === DELIVERY_WORKSPACE_RUNTIME_VERSION, "version");
assert(r.payload.workspace.deliverables.length === 4, "deliverables");
console.log(`PASS — ${r.summary}`);
