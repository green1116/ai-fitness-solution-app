import {
  ROLE_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  ROLE_KINDS,
  runRoleRuntime,
  validateRoleRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-role-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateRoleRuntime({ deploymentId: ID });
assert(v.rolesValid && v.hierarchyValid, "validation");
const r = runRoleRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.roles.length === ROLE_KINDS.length, "five roles");
assert(r.payload.roles.some((role) => role.kind === "owner"), "owner role");
console.log(`PASS — ${r.summary}`);
