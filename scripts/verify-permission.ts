import {
  PERMISSION_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  PERMISSION_DOMAINS,
  runPermissionRuntime,
  validatePermissionRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-permission-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validatePermissionRuntime({ deploymentId: ID });
assert(v.grantsValid && v.domainsValid, "validation");
const r = runPermissionRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.payload.version === PERMISSION_RUNTIME_VERSION, "permission version");
assert(r.payload.grants.length === 25, "25 grants");
for (const domain of PERMISSION_DOMAINS) {
  assert(r.payload.grants.some((g) => g.domain === domain), domain);
}
console.log(`PASS — ${r.summary}`);
