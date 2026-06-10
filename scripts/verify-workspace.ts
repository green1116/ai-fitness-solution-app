import {
  WORKSPACE_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  runWorkspaceRuntime,
  validateWorkspaceRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-workspace-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateWorkspaceRuntime({ deploymentId: ID });
assert(Object.values(v).every(Boolean), "validation");
const r = runWorkspaceRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === WORKSPACE_RUNTIME_VERSION, "workspace version");
assert(r.payload.settings.workspaceId === r.payload.workspace.workspaceId, "settings link");
console.log(`PASS — ${r.summary}`);
