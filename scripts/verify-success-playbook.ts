import {
  SUCCESS_PLAYBOOK_RUNTIME_VERSION,
  PLAYBOOK_TYPES,
  runSuccessPlaybookRuntime,
  validateSuccessPlaybookRuntime,
  assertRuntimeSuccess,
} from "../lib/customer-success";

const ID = "v16-success-playbook-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateSuccessPlaybookRuntime({ deploymentId: ID }).valid, "validation");
const r = runSuccessPlaybookRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === SUCCESS_PLAYBOOK_RUNTIME_VERSION, "version");
assert(r.payload.playbooks.length === PLAYBOOK_TYPES.length, "playbooks");
console.log(`PASS — ${r.summary}`);
