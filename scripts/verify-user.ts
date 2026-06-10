import {
  USER_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  runUserRuntime,
  validateUserRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-user-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateUserRuntime({ deploymentId: ID });
assert(v.profilesValid && v.membershipsValid, "validation");
const r = runUserRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === USER_RUNTIME_VERSION, "user version");
assert(r.payload.profiles.length === r.payload.memberships.length, "membership count");
console.log(`PASS — ${r.summary}`);
