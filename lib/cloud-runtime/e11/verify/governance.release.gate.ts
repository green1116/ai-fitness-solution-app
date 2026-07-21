/**
 * E11-P4 — Governance Release Gate
 */

import { createExecutionManager } from "../execution/execution.manager";
import { clearExecutionQueue } from "../execution/execution.queue";
import { clearExecutionResults } from "../execution/execution.result";
import { clearExecutionTraces } from "../execution/execution.trace";
import { clearRuntimes } from "../registry/cloud.registry";
import { clearContexts } from "../runtime/cloud.context";
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
  E11_GOVERNANCE_BASE,
  E11_GOVERNANCE_ID,
  E11_GOVERNANCE_VERSION,
  GOVERNANCE_RESOURCE_TYPES,
  WORKLOAD_PRIORITIES,
} from "../governance/governance.constants";
import { clearAllocations } from "../governance/governance.allocation";
import { resetAdmissionCounters } from "../governance/governance.admission";
import {
  createGovernanceManager,
  getGovernanceRegistryManifest,
} from "../governance/governance.manager";
import { clearResources } from "../governance/governance.resource";
import { clearThrottlePolicies } from "../governance/governance.throttle";

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

export const E11_P4_SIGNOFF_VERSION = "e11-p4-signoff-1" as const;

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

export function checkE11P4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GV-P4-CONSTANTS",
      "governance",
      "Governance version constants",
      E11_GOVERNANCE_ID === "enterprise-e11-cloud-runtime-governance-v1" &&
        E11_GOVERNANCE_VERSION === "e11-governance-1" &&
        E11_GOVERNANCE_BASE ===
          "enterprise-e11-p3-cloud-runtime-multi-tenant-isolation-v1" &&
        GOVERNANCE_RESOURCE_TYPES.length === 4 &&
        WORKLOAD_PRIORITIES.length === 4,
      `id=${E11_GOVERNANCE_ID} base=${E11_GOVERNANCE_BASE}`,
    ),
  );

  try {
    cleanup();
    const rt = createRuntime({
      id: "e11.p4.gate.rt",
      name: "Gate RT",
      kind: "WORKER",
    });
    registerCreatedRuntime(rt);
    startRuntime(rt.id);

    const org = registerOrganization({
      id: "e11.p4.gate.org",
      name: "Gate Org",
    });
    const tenant = registerTenant({
      id: "e11.p4.gate.tenant",
      name: "Gate Tenant",
      organizationId: org.id,
    });
    createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 10 });

    const gov = createGovernanceManager({ managerId: "e11-p4-gate" });
    gov.initialize();
    gov.start();

    const resource = gov.registerResource({
      id: "e11.p4.gate.cpu",
      name: "Gate CPU",
      type: "CPU",
      capacity: 100,
      runtimeId: rt.id,
      tenantId: tenant.id,
    });
    gov.createThrottlePolicy({
      id: "e11.p4.gate.throttle",
      name: "Soft Gate",
      mode: "SOFT",
      threshold: 0.95,
    });

    const admitted = gov.admitAndAllocate({
      tenantId: tenant.id,
      resourceId: resource.id,
      runtimeId: rt.id,
      amount: 20,
      priority: "HIGH",
    });

    const execution = createExecutionManager({ managerId: "e11-p4-exec" });
    execution.initialize();
    execution.start();
    const execResult = gov.admitAndExecute(execution, {
      tenantId: tenant.id,
      resourceId: resource.id,
      runtimeId: rt.id,
      amount: 10,
      priority: "NORMAL",
      taskName: "Gate Task",
      kind: "INVOKE",
    });

    const metrics = gov.metrics();
    const manifest = getGovernanceRegistryManifest();
    const cap = gov.capacity(resource.id);

    const ok =
      admitted.admission.decision === "ADMIT" &&
      admitted.allocation?.status === "ACTIVE" &&
      execResult.executed === true &&
      metrics.activeAllocations >= 1 &&
      cap.available === 100 - 20 - 10 &&
      manifest.governanceId === E11_GOVERNANCE_ID &&
      manifest.base === E11_GOVERNANCE_BASE;

    checks.push(
      check(
        "GV-P4-STACK",
        "governance",
        "Resource / allocate / admit / execute / metrics",
        ok,
        `admit=${admitted.admission.decision} executed=${execResult.executed} available=${cap.available}`,
      ),
    );

    execution.stop();
    gov.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "GV-P4-STACK",
        "governance",
        "Resource / allocate / admit / execute / metrics",
        false,
        error instanceof Error ? error.message : "governance probe failed",
      ),
    );
  }

  // Reject when capacity insufficient
  try {
    cleanup();
    const org = registerOrganization({
      id: "e11.p4.cap.org",
      name: "Cap Org",
    });
    const tenant = registerTenant({
      id: "e11.p4.cap.tenant",
      name: "Cap Tenant",
      organizationId: org.id,
    });
    const gov = createGovernanceManager({ managerId: "e11-p4-cap" });
    gov.initialize();
    gov.start();
    gov.registerResource({
      id: "e11.p4.cap.mem",
      name: "Tiny Mem",
      type: "MEMORY",
      capacity: 5,
      tenantId: tenant.id,
    });
    const denied = gov.admit({
      tenantId: tenant.id,
      resourceId: "e11.p4.cap.mem",
      amount: 10,
      priority: "LOW",
    });

    checks.push(
      check(
        "GV-P4-REJECT",
        "governance",
        "Admission rejects over-capacity",
        denied.decision === "REJECT",
        `decision=${denied.decision}`,
      ),
    );

    gov.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "GV-P4-REJECT",
        "governance",
        "Admission rejects over-capacity",
        false,
        error instanceof Error ? error.message : "reject probe failed",
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
      `e11-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P4ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P4 release gate failed: ${gate.summary}`);
  }
}
