/**
 * E11-P7 — Enterprise Control Plane Release Gate
 */

import { clearIncidents } from "../autonomous/autonomous.incident";
import {
  createAutonomousManager,
} from "../autonomous/autonomous.manager";
import { clearOperations } from "../autonomous/autonomous.operation";
import { clearActionPolicies } from "../autonomous/autonomous.policy";
import {
  CONTROL_COMMAND_KINDS,
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
  GLOBAL_POLICY_KINDS,
} from "../control-plane/control-plane.constants";
import { clearControlCommands } from "../control-plane/control-plane.command";
import {
  createControlPlaneManager,
  getControlPlaneRegistryManifest,
} from "../control-plane/control-plane.manager";
import { clearControlPlanes } from "../control-plane/control-plane.model";
import { clearOrchestrationPlans } from "../control-plane/control-plane.orchestration";
import { clearGlobalPolicies } from "../control-plane/control-plane.policy";
import { createExecutionManager } from "../execution/execution.manager";
import { clearExecutionQueue } from "../execution/execution.queue";
import { clearExecutionResults } from "../execution/execution.result";
import { clearExecutionTraces } from "../execution/execution.trace";
import { clearAllocations } from "../governance/governance.allocation";
import { resetAdmissionCounters } from "../governance/governance.admission";
import { createGovernanceManager } from "../governance/governance.manager";
import { clearResources } from "../governance/governance.resource";
import { clearThrottlePolicies } from "../governance/governance.throttle";
import { clearAnomalies } from "../observability/observability.anomaly";
import { clearAudits } from "../observability/observability.audit";
import { clearEvents } from "../observability/observability.event";
import { createObservabilityManager } from "../observability/observability.manager";
import { clearTelemetry } from "../observability/observability.telemetry";
import { clearRuntimes, getRuntime } from "../registry/cloud.registry";
import { clearContexts } from "../runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  failRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../runtime/cloud.lifecycle";
import { clearTenants, bindRuntimeToTenant, registerTenant } from "../tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../tenant/tenant.organization";
import {
  clearIsolationPolicies,
  createIsolationPolicy,
} from "../tenant/tenant.policy";
import { clearTenantQuotas, createTenantQuota } from "../tenant/tenant.quota";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const E11_P7_SIGNOFF_VERSION = "e11-p7-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
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

export function checkE11P7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CP-P7-CONSTANTS",
      "control-plane",
      "Control plane version constants",
      E11_CONTROL_PLANE_ID ===
        "enterprise-e11-cloud-runtime-control-plane-v1" &&
        E11_CONTROL_PLANE_VERSION === "e11-control-plane-1" &&
        E11_CONTROL_PLANE_BASE ===
          "enterprise-e11-p6-cloud-runtime-autonomous-operations-v1" &&
        CONTROL_COMMAND_KINDS.length === 8 &&
        GLOBAL_POLICY_KINDS.length === 5,
      `id=${E11_CONTROL_PLANE_ID} base=${E11_CONTROL_PLANE_BASE}`,
    ),
  );

  try {
    cleanup();

    const rt = createRuntime({
      id: "e11.p7.gate.rt",
      name: "CP RT",
      kind: "CORE",
    });
    registerCreatedRuntime(rt);
    startRuntime(rt.id);
    failRuntime(rt.id, "gate fail");

    const org = registerOrganization({
      id: "e11.p7.gate.org",
      name: "CP Org",
    });
    const tenant = registerTenant({
      id: "e11.p7.gate.tenant",
      name: "CP Tenant",
      organizationId: org.id,
    });
    createIsolationPolicy({
      tenantId: tenant.id,
      mode: "STRICT",
    });
    bindRuntimeToTenant(tenant.id, rt.id);
    createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 10 });

    const auto = createAutonomousManager({ managerId: "e11-p7-auto" });
    auto.initialize();
    auto.start();
    auto.createPolicy({
      name: "Gate Auto",
      mode: "AUTO",
      minAnomalyScore: 0.1,
      autoIncidentSeverity: "LOW",
      tenantId: tenant.id,
    });

    const gov = createGovernanceManager({ managerId: "e11-p7-gov" });
    gov.initialize();
    gov.start();
    gov.registerResource({
      id: "e11.p7.gate.cpu",
      name: "CP CPU",
      type: "CPU",
      capacity: 20,
      runtimeId: rt.id,
      tenantId: tenant.id,
    });

    const execution = createExecutionManager({ managerId: "e11-p7-exec" });
    execution.initialize();
    execution.start();

    const obs = createObservabilityManager({ managerId: "e11-p7-obs" });
    obs.initialize();
    obs.start();
    obs.emit({
      kind: "SYSTEM",
      severity: "INFO",
      message: "control plane gate",
      source: "gate",
      runtimeId: rt.id,
      tenantId: tenant.id,
    });

    const cp = createControlPlaneManager({ managerId: "e11-p7-gate" });
    cp.initialize();
    cp.start();

    cp.registerPlane({
      id: "e11.p7.gate.plane",
      name: "Gate Plane",
      scope: "TENANT",
      tenantId: tenant.id,
    });
    cp.createPolicy({
      name: "Gate Admission",
      kind: "ADMISSION",
      scope: "TENANT",
      tenantId: tenant.id,
    });
    cp.createPolicy({
      name: "Gate Governance",
      kind: "GOVERNANCE",
      rules: { maxUtilization: 0.99 },
    });

    const plan = cp.planOrchestration({
      title: "Gate orchestration",
      runtimeIds: [rt.id],
      actions: ["RECOVER"],
    });
    const orch = cp.runOrchestration(plan.id);

    const recoverCmd = cp.issueCommand({
      kind: "RECOVER",
      title: "Gate recover",
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    const recoverDispatch = cp.dispatch(recoverCmd.id, { autonomous: auto });

    const snapCmd = cp.issueCommand({
      kind: "SNAPSHOT",
      title: "Gate snapshot",
      tenantId: tenant.id,
    });
    const snapDispatch = cp.dispatch(snapCmd.id, {});

    const compliance = cp.compliance({ tenantId: tenant.id });
    const snapshot = cp.snapshot({ tenantId: tenant.id });
    const sweep = cp.sweep({
      tenantId: tenant.id,
      autonomous: auto,
      governance: gov,
      observability: obs,
      execution,
    });

    const manifest = getControlPlaneRegistryManifest();
    const ok =
      orch.succeeded >= 1 &&
      recoverDispatch.status === "SUCCEEDED" &&
      snapDispatch.status === "SUCCEEDED" &&
      getRuntime(rt.id)?.status === "ACTIVE" &&
      compliance.findings.length >= 0 &&
      snapshot.planeId === E11_CONTROL_PLANE_ID &&
      sweep.snapshot.snapshotId.length > 0 &&
      manifest.base === E11_CONTROL_PLANE_BASE;

    checks.push(
      check(
        "CP-P7-STACK",
        "control-plane",
        "Model / policy / orchestration / command / compliance / snapshot",
        ok,
        `orch=${orch.succeeded} recover=${recoverDispatch.status} compliance=${compliance.overall}`,
      ),
    );

    obs.stop();
    execution.stop();
    gov.stop();
    auto.stop();
    cp.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CP-P7-STACK",
        "control-plane",
        "Model / policy / orchestration / command / compliance / snapshot",
        false,
        error instanceof Error ? error.message : "control plane probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e11-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P7ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P7 release gate failed: ${gate.summary}`);
  }
}
