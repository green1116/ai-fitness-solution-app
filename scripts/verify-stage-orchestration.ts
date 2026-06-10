import {
  STAGE_ORCHESTRATION_RUNTIME_VERSION,
  runStageOrchestrationRuntime,
  validateStageOrchestrationRuntime,
  assertRuntimeSuccess,
} from "../lib/autopilot";

const ID = "v13.5-stage-orchestration-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

assert(validateStageOrchestrationRuntime({ deploymentId: ID }).valid, "validation");
const r = runStageOrchestrationRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === STAGE_ORCHESTRATION_RUNTIME_VERSION, "version");
assert(r.payload.state.executions.length === 8, "executions");
console.log(`PASS — ${r.summary}`);
