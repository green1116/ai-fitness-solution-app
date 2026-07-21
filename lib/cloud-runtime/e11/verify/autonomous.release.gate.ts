/**
 * E11-P6 — Autonomous Operations Release Gate
 */

import {
  AUTONOMOUS_OPERATION_KINDS,
  E11_AUTONOMOUS_BASE,
  E11_AUTONOMOUS_ID,
  E11_AUTONOMOUS_VERSION,
} from "../autonomous/autonomous.constants";
import { clearIncidents } from "../autonomous/autonomous.incident";
import {
  createAutonomousManager,
  getAutonomousRegistryManifest,
} from "../autonomous/autonomous.manager";
import { clearOperations } from "../autonomous/autonomous.operation";
import { clearActionPolicies } from "../autonomous/autonomous.policy";
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
import { clearTenants, registerTenant } from "../tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../tenant/tenant.organization";
import { clearIsolationPolicies } from "../tenant/tenant.policy";
import { clearTenantQuotas } from "../tenant/tenant.quota";

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

export const E11_P6_SIGNOFF_VERSION = "e11-p6-signoff-1" as const;

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

export function checkE11P6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "AU-P6-CONSTANTS",
      "autonomous",
      "Autonomous version constants",
      E11_AUTONOMOUS_ID === "enterprise-e11-cloud-runtime-autonomous-v1" &&
        E11_AUTONOMOUS_VERSION === "e11-autonomous-1" &&
        E11_AUTONOMOUS_BASE ===
          "enterprise-e11-p5-cloud-runtime-observability-v1" &&
        AUTONOMOUS_OPERATION_KINDS.length === 5,
      `id=${E11_AUTONOMOUS_ID} base=${E11_AUTONOMOUS_BASE}`,
    ),
  );

  try {
    cleanup();

    const rt = createRuntime({
      id: "e11.p6.gate.rt",
      name: "Auto RT",
      kind: "CORE",
    });
    registerCreatedRuntime(rt);
    startRuntime(rt.id);
    failRuntime(rt.id, "gate forced fail");

    const org = registerOrganization({
      id: "e11.p6.gate.org",
      name: "Auto Org",
    });
    const tenant = registerTenant({
      id: "e11.p6.gate.tenant",
      name: "Auto Tenant",
      organizationId: org.id,
    });

    const auto = createAutonomousManager({ managerId: "e11-p6-gate" });
    auto.initialize();
    auto.start();
    auto.createPolicy({
      id: "e11.p6.gate.policy",
      name: "Gate Auto Policy",
      mode: "AUTO",
      minAnomalyScore: 0.1,
      autoIncidentSeverity: "LOW",
      allowedKinds: ["RECOVER", "HEAL", "OPTIMIZE", "INCIDENT"],
    });

    const recovery = auto.recover({
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    const healed = auto.heal({
      tenantId: tenant.id,
      openIncidents: true,
    });

    const gov = createGovernanceManager({ managerId: "e11-p6-gov" });
    gov.initialize();
    gov.start();
    gov.registerResource({
      id: "e11.p6.gate.slot",
      name: "Auto Slots",
      type: "SLOT",
      capacity: 10,
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    gov.allocate({
      resourceId: "e11.p6.gate.slot",
      tenantId: tenant.id,
      runtimeId: rt.id,
      amount: 2,
      priority: "LOW",
    });

    const execution = createExecutionManager({ managerId: "e11-p6-exec" });
    execution.initialize();
    execution.start();

    const opt = auto.optimize({
      utilizationTarget: 0.1,
      execution,
      runtimeId: rt.id,
      tenantId: tenant.id,
    });

    const incident = auto.openIncident({
      title: "Gate incident",
      severity: "HIGH",
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    const acknowledged = auto.setIncidentStatus(incident.id, "ACKNOWLEDGED");
    const manifest = getAutonomousRegistryManifest();

    const ok =
      recovery.recovered === true &&
      getRuntime(rt.id)?.status === "ACTIVE" &&
      healed.operationId.length > 0 &&
      opt.operationId.length > 0 &&
      acknowledged.status === "ACKNOWLEDGED" &&
      auto.listPolicies().length >= 1 &&
      manifest.autonomousId === E11_AUTONOMOUS_ID &&
      manifest.base === E11_AUTONOMOUS_BASE;

    checks.push(
      check(
        "AU-P6-STACK",
        "autonomous",
        "Recover / heal / optimize / incident / policy",
        ok,
        `recovered=${recovery.recovered} heal=${healed.healed} opt=${opt.optimized} policies=${auto.listPolicies().length}`,
      ),
    );

    execution.stop();
    gov.stop();
    auto.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "AU-P6-STACK",
        "autonomous",
        "Recover / heal / optimize / incident / policy",
        false,
        error instanceof Error ? error.message : "autonomous probe failed",
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
      `e11-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P6ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P6 release gate failed: ${gate.summary}`);
  }
}
