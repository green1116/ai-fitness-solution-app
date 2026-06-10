import {
  TENANT_RUNTIME_VERSION,
  ENTERPRISE_SAAS_VERSION,
  TENANT_TIERS,
  runTenantRuntime,
  validateTenantRuntime,
  assertRuntimeSuccess,
} from "../lib/enterprise-saas";

const ID = "v105-tenant-verify";
function assert(c: boolean, m: string) { if (!c) throw new Error(`ASSERT: ${m}`); }

const v = validateTenantRuntime({ deploymentId: ID });
assert(v.tenantValid && v.lifecycleValid && v.tiersValid, "validation");
const r = runTenantRuntime({ deploymentId: ID });
assertRuntimeSuccess(r);
assert(r.version === ENTERPRISE_SAAS_VERSION, "saas version");
assert(r.payload.version === TENANT_RUNTIME_VERSION, "tenant version");
assert(TENANT_TIERS.includes(r.payload.tenant.tier), "tier");
console.log(`PASS — ${r.summary}`);
