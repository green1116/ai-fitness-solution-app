/**
 * E11-P3 — Tenant Isolation Release Gate
 */

import { clearRuntimes } from "../registry/cloud.registry";
import { clearContexts } from "../runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../runtime/cloud.lifecycle";
import { createExecutionManager } from "../execution/execution.manager";
import { clearExecutionQueue } from "../execution/execution.queue";
import { clearExecutionResults } from "../execution/execution.result";
import { clearExecutionTraces } from "../execution/execution.trace";
import {
  E11_TENANT_BASE,
  E11_TENANT_ID,
  E11_TENANT_VERSION,
  ISOLATION_POLICY_MODES,
  TENANT_QUOTA_TYPES,
} from "../tenant/tenant.constants";
import {
  createTenantManager,
  getTenantRegistryManifest,
} from "../tenant/tenant.manager";
import { clearTenants } from "../tenant/tenant.namespace";
import { clearOrganizations } from "../tenant/tenant.organization";
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

export const E11_P3_SIGNOFF_VERSION = "e11-p3-signoff-1" as const;

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

export function checkE11P3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "TN-P3-CONSTANTS",
      "tenant",
      "Tenant version constants",
      E11_TENANT_ID === "enterprise-e11-cloud-runtime-tenant-v1" &&
        E11_TENANT_VERSION === "e11-tenant-1" &&
        E11_TENANT_BASE ===
          "enterprise-e11-p2-cloud-runtime-execution-v1" &&
        TENANT_QUOTA_TYPES.length === 4 &&
        ISOLATION_POLICY_MODES.length === 3,
      `id=${E11_TENANT_ID} base=${E11_TENANT_BASE}`,
    ),
  );

  try {
    cleanup();
    const created = createRuntime({
      id: "e11.p3.gate.rt",
      name: "Gate RT",
      kind: "WORKER",
    });
    registerCreatedRuntime(created);
    startRuntime(created.id);

    const tenantMgr = createTenantManager({ managerId: "e11-p3-gate" });
    tenantMgr.initialize();
    tenantMgr.start();

    const org = tenantMgr.registerOrganization({
      id: "e11.p3.gate.org",
      name: "Gate Org",
    });
    const tenant = tenantMgr.registerTenant({
      id: "e11.p3.gate.tenant",
      name: "Gate Tenant",
      organizationId: org.id,
    });
    tenantMgr.bindRuntime(tenant.id, created.id);
    tenantMgr.createQuota({
      tenantId: tenant.id,
      type: "TASK",
      limit: 5,
    });
    tenantMgr.createPolicy({
      tenantId: tenant.id,
      mode: "STRICT",
      allowedRuntimeKinds: ["WORKER", "CORE"],
    });

    const allowed = tenantMgr.route({
      tenantId: tenant.id,
      runtimeId: created.id,
      organizationId: org.id,
    });

    const ctx = tenantMgr.openTenantContext(tenant.id, {
      runtimeId: created.id,
    });

    const execution = createExecutionManager({ managerId: "e11-p3-exec" });
    execution.initialize();
    execution.start();
    const routed = tenantMgr.routeAndExecute(execution, {
      tenantId: tenant.id,
      runtimeId: created.id,
      organizationId: org.id,
      taskName: "Gate Task",
      kind: "INVOKE",
      payload: { ok: true },
    });

    const manifest = getTenantRegistryManifest();
    const ok =
      allowed.decision === "ALLOW" &&
      ctx.attributes.tenantId === tenant.id &&
      routed.executed === true &&
      routed.route.decision === "ALLOW" &&
      manifest.tenantId === E11_TENANT_ID &&
      manifest.base === E11_TENANT_BASE &&
      manifest.tenantCount === 1;

    checks.push(
      check(
        "TN-P3-STACK",
        "tenant",
        "Namespace / policy / quota / router / execution",
        ok,
        `route=${allowed.decision} executed=${routed.executed}`,
      ),
    );

    execution.stop();
    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "TN-P3-STACK",
        "tenant",
        "Namespace / policy / quota / router / execution",
        false,
        error instanceof Error ? error.message : "tenant probe failed",
      ),
    );
  }

  // Isolation deny: cross-tenant
  try {
    cleanup();
    const rtA = createRuntime({
      id: "e11.p3.gate.rt.a",
      name: "RT A",
      kind: "CORE",
    });
    registerCreatedRuntime(rtA);
    startRuntime(rtA.id);

    const tenantMgr = createTenantManager({ managerId: "e11-p3-deny" });
    tenantMgr.initialize();
    tenantMgr.start();
    const org = tenantMgr.registerOrganization({
      id: "e11.p3.deny.org",
      name: "Deny Org",
    });
    const t1 = tenantMgr.registerTenant({
      id: "e11.p3.deny.t1",
      name: "T1",
      organizationId: org.id,
    });
    const t2 = tenantMgr.registerTenant({
      id: "e11.p3.deny.t2",
      name: "T2",
      organizationId: org.id,
    });
    tenantMgr.bindRuntime(t1.id, rtA.id);
    tenantMgr.createPolicy({ tenantId: t2.id, mode: "STRICT" });

    const denied = tenantMgr.route(
      { tenantId: t2.id, runtimeId: rtA.id },
      { reserve: false },
    );

    checks.push(
      check(
        "TN-P3-ISOLATION",
        "tenant",
        "Cross-tenant runtime denied",
        denied.decision === "DENY",
        `decision=${denied.decision} reason=${denied.reason}`,
      ),
    );

    tenantMgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "TN-P3-ISOLATION",
        "tenant",
        "Cross-tenant runtime denied",
        false,
        error instanceof Error ? error.message : "isolation probe failed",
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
      `e11-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P3ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P3 release gate failed: ${gate.summary}`);
  }
}
