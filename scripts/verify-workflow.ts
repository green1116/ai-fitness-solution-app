import {
  WORKFLOW_RUNTIME_VERSION,
  WORKFLOW_STEPS,
  runWorkflowRuntime,
  validateWorkflowRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-workflow-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateWorkflowRuntime({ deploymentId: ID }).valid, "validation");
const r = runWorkflowRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === WORKFLOW_RUNTIME_VERSION, "version");
assert(r.payload.workflow.steps.length === WORKFLOW_STEPS.length, "eight steps");
console.log(`PASS — ${r.summary}`);
