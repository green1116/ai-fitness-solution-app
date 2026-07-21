/**
 * E11-P5 — Observability Release Gate
 */

import { createExecutionManager } from "../execution/execution.manager";
import { clearExecutionQueue } from "../execution/execution.queue";
import { clearExecutionResults } from "../execution/execution.result";
import { clearExecutionTraces } from "../execution/execution.trace";
import { clearAllocations } from "../governance/governance.allocation";
import { resetAdmissionCounters } from "../governance/governance.admission";
import { clearResources } from "../governance/governance.resource";
import { clearThrottlePolicies } from "../governance/governance.throttle";
import { createGovernanceManager } from "../governance/governance.manager";
import { clearRuntimes } from "../registry/cloud.registry";
import {
  activateContext,
  clearContexts,
  openContext,
} from "../runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../runtime/cloud.lifecycle";
import { clearTenants, registerTenant } from "../tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../tenant/tenant.organization";
import { clearIsolationPolicies } from "../tenant/tenant.policy";
import {
  clearTenantQuotas,
  createTenantQuota,
} from "../tenant/tenant.quota";
import {
  E11_OBSERVABILITY_BASE,
  E11_OBSERVABILITY_ID,
  E11_OBSERVABILITY_VERSION,
  OBSERVABILITY_EVENT_KINDS,
  ANOMALY_KINDS,
} from "../observability/observability.constants";
import { clearAnomalies } from "../observability/observability.anomaly";
import { clearAudits } from "../observability/observability.audit";
import { clearEvents } from "../observability/observability.event";
import {
  createObservabilityManager,
  getObservabilityRegistryManifest,
} from "../observability/observability.manager";
import { clearTelemetry } from "../observability/observability.telemetry";

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

export const E11_P5_SIGNOFF_VERSION = "e11-p5-signoff-1" as const;

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

export function checkE11P5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OB-P5-CONSTANTS",
      "observability",
      "Observability version constants",
      E11_OBSERVABILITY_ID ===
        "enterprise-e11-cloud-runtime-observability-v1" &&
        E11_OBSERVABILITY_VERSION === "e11-observability-1" &&
        E11_OBSERVABILITY_BASE ===
          "enterprise-e11-p4-cloud-runtime-resource-governance-v1" &&
        OBSERVABILITY_EVENT_KINDS.length === 6 &&
        ANOMALY_KINDS.length === 5,
      `id=${E11_OBSERVABILITY_ID} base=${E11_OBSERVABILITY_BASE}`,
    ),
  );

  try {
    cleanup();
    const rt = createRuntime({
      id: "e11.p5.gate.rt",
      name: "Obs RT",
      kind: "MONITOR",
    });
    registerCreatedRuntime(rt);
    startRuntime(rt.id);

    const org = registerOrganization({
      id: "e11.p5.gate.org",
      name: "Obs Org",
    });
    const tenant = registerTenant({
      id: "e11.p5.gate.tenant",
      name: "Obs Tenant",
      organizationId: org.id,
    });
    createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 10 });

    const ctx = openContext({
      runtimeId: rt.id,
      correlationId: "obs-gate",
      attributes: {
        tenantId: tenant.id,
        organizationId: org.id,
        namespaceKey: tenant.namespaceKey,
      },
    });
    activateContext(ctx.contextId);

    const execution = createExecutionManager({ managerId: "e11-p5-exec" });
    execution.initialize();
    execution.start();
    const task = execution.createTask({
      name: "Obs Task",
      kind: "PROBE",
      runtimeId: rt.id,
      contextId: ctx.contextId,
    });
    execution.queue(task.id);
    execution.execute(task.id);

    const gov = createGovernanceManager({ managerId: "e11-p5-gov" });
    gov.initialize();
    gov.start();
    gov.registerResource({
      id: "e11.p5.gate.cpu",
      name: "Obs CPU",
      type: "CPU",
      capacity: 50,
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    gov.allocate({
      resourceId: "e11.p5.gate.cpu",
      tenantId: tenant.id,
      runtimeId: rt.id,
      amount: 10,
      priority: "NORMAL",
    });

    const obs = createObservabilityManager({ managerId: "e11-p5-obs" });
    obs.initialize();
    obs.start();
    obs.emit({
      kind: "LIFECYCLE",
      message: "runtime started",
      source: "gate",
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    obs.emitFromContext(ctx.contextId, {
      kind: "TENANT",
      message: "tenant context observed",
      source: "gate",
    });
    obs.recordAudit({
      action: "EXECUTE",
      actor: "gate",
      target: task.id,
      tenantId: tenant.id,
      runtimeId: rt.id,
    });
    obs.collectExecutionTraces();
    obs.collectGovernance();
    const health = obs.health();
    const anomalies = obs.detectAnomalies({ utilizationThreshold: 0.99 });
    const metrics = obs.metrics();
    const manifest = getObservabilityRegistryManifest();

    const ok =
      health.runtimeCount >= 1 &&
      metrics.eventCount >= 2 &&
      metrics.auditCount >= 1 &&
      metrics.executionTraceCount >= 1 &&
      metrics.telemetryCount >= 1 &&
      manifest.observabilityId === E11_OBSERVABILITY_ID &&
      manifest.base === E11_OBSERVABILITY_BASE;

    checks.push(
      check(
        "OB-P5-STACK",
        "observability",
        "Event / telemetry / audit / health / metrics integration",
        ok,
        `events=${metrics.eventCount} traces=${metrics.executionTraceCount} anomalies=${anomalies.length}`,
      ),
    );

    obs.stop();
    gov.stop();
    execution.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OB-P5-STACK",
        "observability",
        "Event / telemetry / audit / health / metrics integration",
        false,
        error instanceof Error ? error.message : "obs probe failed",
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
      `e11-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P5ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P5 release gate failed: ${gate.summary}`);
  }
}
