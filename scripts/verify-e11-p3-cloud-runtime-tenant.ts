/**
 * E11-P3 — Cloud Runtime Multi-Tenant Isolation verification
 */
import fs from "node:fs";
import path from "node:path";

import { E11_EXECUTION_ID } from "../lib/cloud-runtime/e11/execution/execution.constants";
import { createExecutionManager } from "../lib/cloud-runtime/e11/execution/execution.manager";
import { clearExecutionQueue } from "../lib/cloud-runtime/e11/execution/execution.queue";
import { clearExecutionResults } from "../lib/cloud-runtime/e11/execution/execution.result";
import { clearExecutionTraces } from "../lib/cloud-runtime/e11/execution/execution.trace";
import { clearRuntimes, getRuntime } from "../lib/cloud-runtime/e11/registry/cloud.registry";
import { clearContexts } from "../lib/cloud-runtime/e11/runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import {
  E11_P3_TENANT_FREEZE_VERSION,
  E11_TENANT_BASE,
  E11_TENANT_FREEZE_VERSION,
  E11_TENANT_ID,
  E11_TENANT_VERSION,
  ISOLATION_POLICY_MODES,
  ORGANIZATION_STATUSES,
  TENANT_QUOTA_TYPES,
  TENANT_STATUSES,
} from "../lib/cloud-runtime/e11/tenant/tenant.constants";
import {
  createTenantManager,
  getTenantRegistryManifest,
} from "../lib/cloud-runtime/e11/tenant/tenant.manager";
import { clearTenants } from "../lib/cloud-runtime/e11/tenant/tenant.namespace";
import { clearOrganizations } from "../lib/cloud-runtime/e11/tenant/tenant.organization";
import { clearIsolationPolicies } from "../lib/cloud-runtime/e11/tenant/tenant.policy";
import { clearTenantQuotas } from "../lib/cloud-runtime/e11/tenant/tenant.quota";
import {
  assertE11P3ReleaseGatePass,
  checkE11P3ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/tenant.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearIsolationPolicies();
  clearTenantQuotas();
  clearTenants();
  clearOrganizations();
  clearExecutionTraces();
  clearExecutionResults();
  clearExecutionQueue();
  clearContexts();
  clearLifecycles();
  clearRuntimes();
}

function checkModules() {
  const required = [
    "lib/cloud-runtime/e11/tenant/tenant.constants.ts",
    "lib/cloud-runtime/e11/tenant/tenant.types.ts",
    "lib/cloud-runtime/e11/tenant/tenant.organization.ts",
    "lib/cloud-runtime/e11/tenant/tenant.namespace.ts",
    "lib/cloud-runtime/e11/tenant/tenant.quota.ts",
    "lib/cloud-runtime/e11/tenant/tenant.policy.ts",
    "lib/cloud-runtime/e11/tenant/tenant.router.ts",
    "lib/cloud-runtime/e11/tenant/tenant.manager.ts",
    "lib/cloud-runtime/e11/verify/tenant.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(E11_TENANT_ID === "enterprise-e11-cloud-runtime-tenant-v1", "tenant id");
  check(E11_TENANT_VERSION === "e11-tenant-1", "tenant version");
  check(E11_TENANT_FREEZE_VERSION === "e11-tenant-freeze-1", "tenant freeze");
  check(
    E11_TENANT_BASE === "enterprise-e11-p2-cloud-runtime-execution-v1",
    "tenant base",
  );
  check(
    E11_P3_TENANT_FREEZE_VERSION === "e11-p3-cloud-runtime-tenant-freeze-1",
    "p3 freeze",
  );
  check(TENANT_STATUSES.length === 3, "tenant statuses");
  check(ORGANIZATION_STATUSES.length === 3, "org statuses");
  check(TENANT_QUOTA_TYPES.length === 4, "quota types");
  check(ISOLATION_POLICY_MODES.length === 3, "policy modes");
  check(
    E11_EXECUTION_ID === "enterprise-e11-cloud-runtime-execution-v1",
    "p2 id intact",
  );
  console.log("✓ version constants");
}

function testTenantStack() {
  cleanup();

  const rt = createRuntime({
    id: "e11.verify.tenant.rt",
    name: "Tenant RT",
    kind: "WORKER",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);
  check(getRuntime(rt.id)?.status === "ACTIVE", "runtime active");

  const tenantMgr = createTenantManager({ managerId: "e11-p3-verify" });
  check(tenantMgr.initialize().status === "READY", "tenant ready");
  check(tenantMgr.start().status === "RUNNING", "tenant running");

  const org = tenantMgr.registerOrganization({
    id: "e11.verify.org",
    name: "Verify Org",
  });
  const tenant = tenantMgr.registerTenant({
    id: "e11.verify.tenant",
    name: "Verify Tenant",
    organizationId: org.id,
  });
  check(tenant.namespaceKey.includes(org.id), "namespace key");

  tenantMgr.bindRuntime(tenant.id, rt.id);
  check(
    tenantMgr.getTenant(tenant.id)?.runtimeIds.includes(rt.id) === true,
    "runtime bound",
  );

  tenantMgr.createQuota({ tenantId: tenant.id, type: "TASK", limit: 3 });
  tenantMgr.createQuota({ tenantId: tenant.id, type: "CONTEXT", limit: 2 });
  tenantMgr.createPolicy({
    tenantId: tenant.id,
    mode: "STRICT",
    allowedRuntimeKinds: ["WORKER"],
  });

  const allow = tenantMgr.route({
    tenantId: tenant.id,
    runtimeId: rt.id,
    organizationId: org.id,
  });
  check(allow.decision === "ALLOW", "route allow");
  check(
    tenantMgr.getQuotaByType(tenant.id, "TASK")?.used === 1,
    "task quota reserved",
  );

  const ctx = tenantMgr.openTenantContext(tenant.id, { runtimeId: rt.id });
  check(ctx.attributes.tenantId === tenant.id, "context tenant tag");
  check(ctx.attributes.namespaceKey === tenant.namespaceKey, "context ns");

  const execution = createExecutionManager({ managerId: "e11-p3-exec" });
  execution.initialize();
  execution.start();
  const routed = tenantMgr.routeAndExecute(execution, {
    tenantId: tenant.id,
    runtimeId: rt.id,
    organizationId: org.id,
    taskName: "Verify Task",
    kind: "INVOKE",
    payload: { n: 1 },
  });
  check(routed.executed === true, "executed");
  check(Boolean(routed.taskId), "task id");
  check(execution.getTask(routed.taskId!)?.status === "COMPLETED", "task done");

  const manifest = getTenantRegistryManifest();
  check(manifest.base === E11_TENANT_BASE, "manifest base");
  check(manifest.organizationCount === 1, "org count");
  check(manifest.tenantCount === 1, "tenant count");

  execution.stop();
  tenantMgr.stop();
  cleanup();
  console.log("✓ org / namespace / quota / policy / router / integration");
}

function testIsolationAndQuota() {
  cleanup();
  const rt = createRuntime({
    id: "e11.verify.iso.rt",
    name: "Iso RT",
    kind: "CORE",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);

  const mgr = createTenantManager({ managerId: "e11-p3-iso" });
  mgr.initialize();
  mgr.start();
  const org = mgr.registerOrganization({ id: "e11.iso.org", name: "Iso Org" });
  const t1 = mgr.registerTenant({
    id: "e11.iso.t1",
    name: "T1",
    organizationId: org.id,
  });
  const t2 = mgr.registerTenant({
    id: "e11.iso.t2",
    name: "T2",
    organizationId: org.id,
  });
  mgr.bindRuntime(t1.id, rt.id);
  mgr.createPolicy({ tenantId: t2.id, mode: "STRICT" });
  mgr.createQuota({ tenantId: t1.id, type: "TASK", limit: 1 });

  const deny = mgr.route(
    { tenantId: t2.id, runtimeId: rt.id },
    { reserve: false },
  );
  check(deny.decision === "DENY", "cross-tenant deny");

  const a1 = mgr.route({ tenantId: t1.id, runtimeId: rt.id });
  check(a1.decision === "ALLOW", "t1 allow 1");
  const a2 = mgr.route({ tenantId: t1.id, runtimeId: rt.id });
  check(a2.decision === "QUOTA_EXCEEDED", "quota exceeded");

  mgr.stop();
  cleanup();
  console.log("✓ isolation deny + quota exceeded");
}

function testSignoff() {
  const gate = checkE11P3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P3ReleaseGatePass(gate);
  console.log("✓ tenant release gate");
}

function main() {
  console.log("E11-P3 Cloud Runtime Multi-Tenant Isolation verify");
  checkModules();
  checkConstants();
  testTenantStack();
  testIsolationAndQuota();
  testSignoff();
  console.log("ALL PASS");
}

main();
