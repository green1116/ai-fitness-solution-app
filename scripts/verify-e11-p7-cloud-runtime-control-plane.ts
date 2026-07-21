/**
 * E11-P7 — Cloud Runtime Enterprise Control Plane verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearIncidents } from "../lib/cloud-runtime/e11/autonomous/autonomous.incident";
import {
  createAutonomousManager,
} from "../lib/cloud-runtime/e11/autonomous/autonomous.manager";
import { clearOperations } from "../lib/cloud-runtime/e11/autonomous/autonomous.operation";
import { clearActionPolicies } from "../lib/cloud-runtime/e11/autonomous/autonomous.policy";
import { E11_AUTONOMOUS_ID } from "../lib/cloud-runtime/e11/autonomous/autonomous.constants";
import {
  CONTROL_COMMAND_KINDS,
  CONTROL_PLANE_SCOPES,
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_FREEZE_VERSION,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
  E11_P7_CONTROL_PLANE_FREEZE_VERSION,
  GLOBAL_POLICY_KINDS,
} from "../lib/cloud-runtime/e11/control-plane/control-plane.constants";
import { clearControlCommands } from "../lib/cloud-runtime/e11/control-plane/control-plane.command";
import {
  createControlPlaneManager,
  getControlPlaneRegistryManifest,
} from "../lib/cloud-runtime/e11/control-plane/control-plane.manager";
import { clearControlPlanes } from "../lib/cloud-runtime/e11/control-plane/control-plane.model";
import { clearOrchestrationPlans } from "../lib/cloud-runtime/e11/control-plane/control-plane.orchestration";
import { clearGlobalPolicies } from "../lib/cloud-runtime/e11/control-plane/control-plane.policy";
import { createExecutionManager } from "../lib/cloud-runtime/e11/execution/execution.manager";
import { clearExecutionQueue } from "../lib/cloud-runtime/e11/execution/execution.queue";
import { clearExecutionResults } from "../lib/cloud-runtime/e11/execution/execution.result";
import { clearExecutionTraces } from "../lib/cloud-runtime/e11/execution/execution.trace";
import { clearAllocations } from "../lib/cloud-runtime/e11/governance/governance.allocation";
import { resetAdmissionCounters } from "../lib/cloud-runtime/e11/governance/governance.admission";
import { createGovernanceManager } from "../lib/cloud-runtime/e11/governance/governance.manager";
import { clearResources } from "../lib/cloud-runtime/e11/governance/governance.resource";
import { clearThrottlePolicies } from "../lib/cloud-runtime/e11/governance/governance.throttle";
import { clearAnomalies } from "../lib/cloud-runtime/e11/observability/observability.anomaly";
import { clearAudits } from "../lib/cloud-runtime/e11/observability/observability.audit";
import { clearEvents } from "../lib/cloud-runtime/e11/observability/observability.event";
import { createObservabilityManager } from "../lib/cloud-runtime/e11/observability/observability.manager";
import { clearTelemetry } from "../lib/cloud-runtime/e11/observability/observability.telemetry";
import {
  clearRuntimes,
  getRuntime,
} from "../lib/cloud-runtime/e11/registry/cloud.registry";
import { clearContexts } from "../lib/cloud-runtime/e11/runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  failRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import {
  clearTenants,
  bindRuntimeToTenant,
  registerTenant,
} from "../lib/cloud-runtime/e11/tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../lib/cloud-runtime/e11/tenant/tenant.organization";
import {
  clearIsolationPolicies,
  createIsolationPolicy,
} from "../lib/cloud-runtime/e11/tenant/tenant.policy";
import { clearTenantQuotas, createTenantQuota } from "../lib/cloud-runtime/e11/tenant/tenant.quota";
import {
  assertE11P7ReleaseGatePass,
  checkE11P7ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/control-plane.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearGlobalPolicies();
  clearControlCommands();
  clearOrchestrationPlans();
  clearControlPlanes();
  clearActionPolicies();
  clearIncidents();
  clearOperations();
  clearAnomalies();
  clearAudits();
  clearTelemetry();
  clearEvents();
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
    "lib/cloud-runtime/e11/control-plane/control-plane.constants.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.types.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.model.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.orchestration.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.policy.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.command.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.compliance.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.snapshot.ts",
    "lib/cloud-runtime/e11/control-plane/control-plane.manager.ts",
    "lib/cloud-runtime/e11/verify/control-plane.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_CONTROL_PLANE_ID === "enterprise-e11-cloud-runtime-control-plane-v1",
    "cp id",
  );
  check(E11_CONTROL_PLANE_VERSION === "e11-control-plane-1", "cp version");
  check(
    E11_CONTROL_PLANE_FREEZE_VERSION === "e11-control-plane-freeze-1",
    "cp freeze",
  );
  check(
    E11_CONTROL_PLANE_BASE ===
      "enterprise-e11-p6-cloud-runtime-autonomous-operations-v1",
    "cp base",
  );
  check(
    E11_P7_CONTROL_PLANE_FREEZE_VERSION ===
      "e11-p7-cloud-runtime-control-plane-freeze-1",
    "p7 freeze",
  );
  check(CONTROL_COMMAND_KINDS.length === 8, "command kinds");
  check(GLOBAL_POLICY_KINDS.length === 5, "policy kinds");
  check(CONTROL_PLANE_SCOPES.length === 4, "scopes");
  check(
    E11_AUTONOMOUS_ID === "enterprise-e11-cloud-runtime-autonomous-v1",
    "p6 intact",
  );
  console.log("✓ version constants");
}

function testControlPlaneStack() {
  cleanup();

  const rt = createRuntime({
    id: "e11.verify.cp.rt",
    name: "CP RT",
    kind: "WORKER",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);
  failRuntime(rt.id, "verify fail");

  const org = registerOrganization({
    id: "e11.verify.cp.org",
    name: "CP Org",
  });
  const tenant = registerTenant({
    id: "e11.verify.cp.tenant",
    name: "CP Tenant",
    organizationId: org.id,
  });
  createIsolationPolicy({ tenantId: tenant.id, mode: "STRICT" });
  bindRuntimeToTenant(tenant.id, rt.id);
  createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 10 });

  const auto = createAutonomousManager({ managerId: "e11-p7-auto-verify" });
  auto.initialize();
  auto.start();
  auto.createPolicy({
    name: "Verify Auto",
    mode: "ASSISTED",
    tenantId: tenant.id,
  });

  const gov = createGovernanceManager({ managerId: "e11-p7-gov-verify" });
  gov.initialize();
  gov.start();
  gov.registerResource({
    id: "e11.verify.cp.cpu",
    name: "CP CPU",
    type: "CPU",
    capacity: 50,
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  gov.allocate({
    resourceId: "e11.verify.cp.cpu",
    tenantId: tenant.id,
    runtimeId: rt.id,
    amount: 10,
    priority: "NORMAL",
  });

  const execution = createExecutionManager({
    managerId: "e11-p7-exec-verify",
  });
  execution.initialize();
  execution.start();

  const obs = createObservabilityManager({ managerId: "e11-p7-obs-verify" });
  obs.initialize();
  obs.start();
  obs.emit({
    kind: "TENANT",
    severity: "INFO",
    message: "control plane verify",
    source: "verify",
    runtimeId: rt.id,
    tenantId: tenant.id,
  });

  const cp = createControlPlaneManager({ managerId: "e11-p7-verify" });
  check(cp.initialize().status === "READY", "cp ready");
  check(cp.start().status === "RUNNING", "cp running");

  cp.registerPlane({
    name: "Verify Plane",
    scope: "GLOBAL",
  });
  cp.createPolicy({
    name: "Verify Compliance",
    kind: "COMPLIANCE",
    enforcement: "ENFORCE",
  });
  cp.createPolicy({
    name: "Verify Isolation",
    kind: "ISOLATION",
    scope: "TENANT",
    tenantId: tenant.id,
  });

  const evalAdmission = cp.evaluatePolicy({
    kind: "ADMISSION",
    tenantId: tenant.id,
    resourceId: "e11.verify.cp.cpu",
    runtimeId: rt.id,
    amount: 1,
  });
  check(evalAdmission.allowed === true, "admission allowed");

  const plan = cp.planOrchestration({
    title: "Verify orchestration",
    runtimeIds: [rt.id],
    actions: ["RECOVER"],
  });
  const orch = cp.runOrchestration(plan.id);
  check(orch.succeeded >= 1, "orchestration recover");
  check(getRuntime(rt.id)?.status === "ACTIVE", "runtime active");

  const healCmd = cp.issueCommand({
    kind: "HEAL",
    title: "Verify heal",
    tenantId: tenant.id,
  });
  const healResult = cp.dispatch(healCmd.id, { autonomous: auto });
  check(healResult.status === "SUCCEEDED", "heal dispatch");

  const execCmd = cp.issueCommand({
    kind: "EXECUTE",
    title: "Verify execute",
    tenantId: tenant.id,
    runtimeId: rt.id,
    payload: {
      resourceId: "e11.verify.cp.cpu",
      amount: 1,
      taskName: "cp-probe",
      kind: "PROBE",
    },
  });
  const execResult = cp.dispatch(execCmd.id, {
    governance: gov,
    execution,
  });
  check(execResult.status === "SUCCEEDED", "execute dispatch");

  const compliance = cp.compliance({ tenantId: tenant.id });
  check(compliance.overall.length > 0, "compliance state");

  const snapshot = cp.snapshot({ tenantId: tenant.id });
  check(snapshot.planeId === E11_CONTROL_PLANE_ID, "snapshot plane id");
  check(snapshot.runtimeCount >= 1, "snapshot runtimes");

  const sweep = cp.sweep({
    tenantId: tenant.id,
    autonomous: auto,
    governance: gov,
    observability: obs,
    execution,
  });
  check(sweep.compliance.findings.length >= 0, "sweep compliance");
  check(sweep.snapshot.tenantCount >= 1, "sweep snapshot");

  const manifest = getControlPlaneRegistryManifest();
  check(manifest.base === E11_CONTROL_PLANE_BASE, "manifest base");
  check(cp.listPlanes().length >= 1, "planes");
  check(cp.listPolicies().length >= 2, "policies");
  check(cp.listCommands().length >= 2, "commands");

  obs.stop();
  execution.stop();
  gov.stop();
  auto.stop();
  cp.stop();
  cleanup();
  console.log(
    "✓ model / policy / orchestration / command / compliance / snapshot / sweep",
  );
}

function testSignoff() {
  const gate = checkE11P7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P7ReleaseGatePass(gate);
  console.log("✓ control plane release gate");
}

function main() {
  console.log("E11-P7 Cloud Runtime Enterprise Control Plane verify");
  checkModules();
  checkConstants();
  testControlPlaneStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
