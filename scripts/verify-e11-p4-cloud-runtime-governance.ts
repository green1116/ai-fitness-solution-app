/**
 * E11-P4 — Cloud Runtime Resource Governance verification
 */
import fs from "node:fs";
import path from "node:path";

import { E11_TENANT_ID } from "../lib/cloud-runtime/e11/tenant/tenant.constants";
import { clearTenants, registerTenant } from "../lib/cloud-runtime/e11/tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../lib/cloud-runtime/e11/tenant/tenant.organization";
import { clearIsolationPolicies } from "../lib/cloud-runtime/e11/tenant/tenant.policy";
import {
  clearTenantQuotas,
  createTenantQuota,
  getTenantQuotaByType,
} from "../lib/cloud-runtime/e11/tenant/tenant.quota";
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
  ADMISSION_DECISIONS,
  ALLOCATION_STATUSES,
  E11_GOVERNANCE_BASE,
  E11_GOVERNANCE_FREEZE_VERSION,
  E11_GOVERNANCE_ID,
  E11_GOVERNANCE_VERSION,
  E11_P4_GOVERNANCE_FREEZE_VERSION,
  GOVERNANCE_RESOURCE_TYPES,
  THROTTLE_MODES,
  WORKLOAD_PRIORITIES,
} from "../lib/cloud-runtime/e11/governance/governance.constants";
import { clearAllocations } from "../lib/cloud-runtime/e11/governance/governance.allocation";
import { resetAdmissionCounters } from "../lib/cloud-runtime/e11/governance/governance.admission";
import {
  createGovernanceManager,
  getGovernanceRegistryManifest,
} from "../lib/cloud-runtime/e11/governance/governance.manager";
import { clearResources } from "../lib/cloud-runtime/e11/governance/governance.resource";
import { clearThrottlePolicies } from "../lib/cloud-runtime/e11/governance/governance.throttle";
import {
  assertE11P4ReleaseGatePass,
  checkE11P4ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/governance.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearAllocations();
  clearResources();
  clearThrottlePolicies();
  resetAdmissionCounters();
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
    "lib/cloud-runtime/e11/governance/governance.constants.ts",
    "lib/cloud-runtime/e11/governance/governance.types.ts",
    "lib/cloud-runtime/e11/governance/governance.resource.ts",
    "lib/cloud-runtime/e11/governance/governance.allocation.ts",
    "lib/cloud-runtime/e11/governance/governance.capacity.ts",
    "lib/cloud-runtime/e11/governance/governance.priority.ts",
    "lib/cloud-runtime/e11/governance/governance.throttle.ts",
    "lib/cloud-runtime/e11/governance/governance.admission.ts",
    "lib/cloud-runtime/e11/governance/governance.metrics.ts",
    "lib/cloud-runtime/e11/governance/governance.manager.ts",
    "lib/cloud-runtime/e11/verify/governance.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_GOVERNANCE_ID === "enterprise-e11-cloud-runtime-governance-v1",
    "governance id",
  );
  check(E11_GOVERNANCE_VERSION === "e11-governance-1", "governance version");
  check(
    E11_GOVERNANCE_FREEZE_VERSION === "e11-governance-freeze-1",
    "governance freeze",
  );
  check(
    E11_GOVERNANCE_BASE ===
      "enterprise-e11-p3-cloud-runtime-multi-tenant-isolation-v1",
    "governance base",
  );
  check(
    E11_P4_GOVERNANCE_FREEZE_VERSION ===
      "e11-p4-cloud-runtime-governance-freeze-1",
    "p4 freeze",
  );
  check(GOVERNANCE_RESOURCE_TYPES.length === 4, "resource types");
  check(ALLOCATION_STATUSES.length === 3, "allocation statuses");
  check(WORKLOAD_PRIORITIES.length === 4, "priorities");
  check(THROTTLE_MODES.length === 3, "throttle modes");
  check(ADMISSION_DECISIONS.length === 3, "admission decisions");
  check(E11_TENANT_ID === "enterprise-e11-cloud-runtime-tenant-v1", "p3 intact");
  console.log("✓ version constants");
}

function testGovernanceStack() {
  cleanup();

  const rt = createRuntime({
    id: "e11.verify.gov.rt",
    name: "Gov RT",
    kind: "WORKER",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);
  check(getRuntime(rt.id)?.status === "ACTIVE", "runtime active");

  const org = registerOrganization({
    id: "e11.verify.gov.org",
    name: "Gov Org",
  });
  const tenant = registerTenant({
    id: "e11.verify.gov.tenant",
    name: "Gov Tenant",
    organizationId: org.id,
  });
  createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 5 });

  const gov = createGovernanceManager({ managerId: "e11-p4-verify" });
  check(gov.initialize().status === "READY", "gov ready");
  check(gov.start().status === "RUNNING", "gov running");

  const resource = gov.registerResource({
    id: "e11.verify.gov.cpu",
    name: "Verify CPU",
    type: "CPU",
    capacity: 100,
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  check(resource.capacity === 100, "capacity");

  gov.createThrottlePolicy({
    name: "Verify Soft",
    mode: "SOFT",
    threshold: 0.9,
  });

  const { admission, allocation } = gov.admitAndAllocate({
    tenantId: tenant.id,
    resourceId: resource.id,
    runtimeId: rt.id,
    amount: 30,
    priority: "HIGH",
  });
  check(admission.decision === "ADMIT", "admitted");
  check(allocation?.status === "ACTIVE", "allocated");
  check(gov.capacity(resource.id).available === 70, "available 70");
  check(
    (getTenantQuotaByType(tenant.id, "TASK")?.used ?? 0) >= 1,
    "tenant quota reserved",
  );

  const execution = createExecutionManager({ managerId: "e11-p4-exec" });
  execution.initialize();
  execution.start();
  const routed = gov.admitAndExecute(execution, {
    tenantId: tenant.id,
    resourceId: resource.id,
    runtimeId: rt.id,
    amount: 10,
    priority: "NORMAL",
    taskName: "Gov Task",
    kind: "INVOKE",
    payload: { ok: true },
  });
  check(routed.executed === true, "executed");
  check(execution.getTask(routed.taskId!)?.status === "COMPLETED", "task done");

  const metrics = gov.metrics();
  check(metrics.resourceCount === 1, "metrics resources");
  check(metrics.activeAllocations >= 1, "metrics active");
  check(metrics.admittedCount >= 1, "metrics admitted");

  const released = gov.release(allocation!.id);
  check(released.status === "RELEASED", "released");

  const manifest = getGovernanceRegistryManifest();
  check(manifest.base === E11_GOVERNANCE_BASE, "manifest base");

  execution.stop();
  gov.stop();
  cleanup();
  console.log("✓ resource / allocation / capacity / admit / metrics / execution");
}

function testThrottleAndReject() {
  cleanup();
  const org = registerOrganization({ id: "e11.thr.org", name: "Thr Org" });
  const tenant = registerTenant({
    id: "e11.thr.tenant",
    name: "Thr Tenant",
    organizationId: org.id,
  });

  const gov = createGovernanceManager({ managerId: "e11-p4-thr" });
  gov.initialize();
  gov.start();
  gov.registerResource({
    id: "e11.thr.slot",
    name: "Slots",
    type: "SLOT",
    capacity: 10,
    tenantId: tenant.id,
  });
  // Fill to high utilization
  gov.allocate({
    resourceId: "e11.thr.slot",
    tenantId: tenant.id,
    amount: 9,
    priority: "NORMAL",
  });
  gov.createThrottlePolicy({
    name: "Hard",
    mode: "HARD",
    threshold: 0.5,
    maxConcurrent: 2,
  });

  const low = gov.admit({
    tenantId: tenant.id,
    resourceId: "e11.thr.slot",
    amount: 1,
    priority: "LOW",
  });
  check(low.decision === "REJECT", "hard throttle reject low");

  const over = gov.admit({
    tenantId: tenant.id,
    resourceId: "e11.thr.slot",
    amount: 5,
    priority: "CRITICAL",
  });
  check(over.decision === "REJECT", "capacity reject");

  gov.stop();
  cleanup();
  console.log("✓ throttle + capacity reject");
}

function testSignoff() {
  const gate = checkE11P4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P4ReleaseGatePass(gate);
  console.log("✓ governance release gate");
}

function main() {
  console.log("E11-P4 Cloud Runtime Resource Governance verify");
  checkModules();
  checkConstants();
  testGovernanceStack();
  testThrottleAndReject();
  testSignoff();
  console.log("ALL PASS");
}

main();
