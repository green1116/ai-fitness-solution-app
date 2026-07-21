/**
 * E11-P5 — Cloud Runtime Observability Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { createExecutionManager } from "../lib/cloud-runtime/e11/execution/execution.manager";
import { clearExecutionQueue } from "../lib/cloud-runtime/e11/execution/execution.queue";
import { clearExecutionResults } from "../lib/cloud-runtime/e11/execution/execution.result";
import { clearExecutionTraces } from "../lib/cloud-runtime/e11/execution/execution.trace";
import { clearAllocations } from "../lib/cloud-runtime/e11/governance/governance.allocation";
import { resetAdmissionCounters } from "../lib/cloud-runtime/e11/governance/governance.admission";
import { E11_GOVERNANCE_ID } from "../lib/cloud-runtime/e11/governance/governance.constants";
import { createGovernanceManager } from "../lib/cloud-runtime/e11/governance/governance.manager";
import { clearResources } from "../lib/cloud-runtime/e11/governance/governance.resource";
import { clearThrottlePolicies } from "../lib/cloud-runtime/e11/governance/governance.throttle";
import {
  ANOMALY_KINDS,
  AUDIT_ACTIONS,
  E11_OBSERVABILITY_BASE,
  E11_OBSERVABILITY_FREEZE_VERSION,
  E11_OBSERVABILITY_ID,
  E11_OBSERVABILITY_VERSION,
  E11_P5_OBSERVABILITY_FREEZE_VERSION,
  OBSERVABILITY_EVENT_KINDS,
  OBSERVABILITY_EVENT_SEVERITIES,
  TELEMETRY_SIGNAL_TYPES,
} from "../lib/cloud-runtime/e11/observability/observability.constants";
import { clearAnomalies } from "../lib/cloud-runtime/e11/observability/observability.anomaly";
import { clearAudits } from "../lib/cloud-runtime/e11/observability/observability.audit";
import { clearEvents } from "../lib/cloud-runtime/e11/observability/observability.event";
import {
  createObservabilityManager,
  getObservabilityRegistryManifest,
} from "../lib/cloud-runtime/e11/observability/observability.manager";
import { clearTelemetry } from "../lib/cloud-runtime/e11/observability/observability.telemetry";
import { clearRuntimes, getRuntime } from "../lib/cloud-runtime/e11/registry/cloud.registry";
import {
  activateContext,
  clearContexts,
  openContext,
} from "../lib/cloud-runtime/e11/runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import { clearTenants, registerTenant } from "../lib/cloud-runtime/e11/tenant/tenant.namespace";
import {
  clearOrganizations,
  registerOrganization,
} from "../lib/cloud-runtime/e11/tenant/tenant.organization";
import { clearIsolationPolicies } from "../lib/cloud-runtime/e11/tenant/tenant.policy";
import {
  clearTenantQuotas,
  createTenantQuota,
} from "../lib/cloud-runtime/e11/tenant/tenant.quota";
import {
  assertE11P5ReleaseGatePass,
  checkE11P5ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/observability.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
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
    "lib/cloud-runtime/e11/observability/observability.constants.ts",
    "lib/cloud-runtime/e11/observability/observability.types.ts",
    "lib/cloud-runtime/e11/observability/observability.event.ts",
    "lib/cloud-runtime/e11/observability/observability.telemetry.ts",
    "lib/cloud-runtime/e11/observability/observability.audit.ts",
    "lib/cloud-runtime/e11/observability/observability.health.ts",
    "lib/cloud-runtime/e11/observability/observability.anomaly.ts",
    "lib/cloud-runtime/e11/observability/observability.metrics.ts",
    "lib/cloud-runtime/e11/observability/observability.manager.ts",
    "lib/cloud-runtime/e11/verify/observability.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_OBSERVABILITY_ID === "enterprise-e11-cloud-runtime-observability-v1",
    "obs id",
  );
  check(E11_OBSERVABILITY_VERSION === "e11-observability-1", "obs version");
  check(
    E11_OBSERVABILITY_FREEZE_VERSION === "e11-observability-freeze-1",
    "obs freeze",
  );
  check(
    E11_OBSERVABILITY_BASE ===
      "enterprise-e11-p4-cloud-runtime-resource-governance-v1",
    "obs base",
  );
  check(
    E11_P5_OBSERVABILITY_FREEZE_VERSION ===
      "e11-p5-cloud-runtime-observability-freeze-1",
    "p5 freeze",
  );
  check(OBSERVABILITY_EVENT_KINDS.length === 6, "event kinds");
  check(OBSERVABILITY_EVENT_SEVERITIES.length === 5, "severities");
  check(TELEMETRY_SIGNAL_TYPES.length === 4, "telemetry types");
  check(AUDIT_ACTIONS.length === 7, "audit actions");
  check(ANOMALY_KINDS.length === 5, "anomaly kinds");
  check(
    E11_GOVERNANCE_ID === "enterprise-e11-cloud-runtime-governance-v1",
    "p4 intact",
  );
  console.log("✓ version constants");
}

function testObservabilityStack() {
  cleanup();

  const rt = createRuntime({
    id: "e11.verify.obs.rt",
    name: "Obs RT",
    kind: "MONITOR",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);
  check(getRuntime(rt.id)?.status === "ACTIVE", "runtime active");

  const org = registerOrganization({
    id: "e11.verify.obs.org",
    name: "Obs Org",
  });
  const tenant = registerTenant({
    id: "e11.verify.obs.tenant",
    name: "Obs Tenant",
    organizationId: org.id,
  });
  createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 2 });

  const ctx = openContext({
    runtimeId: rt.id,
    correlationId: "obs-verify",
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
  const okTask = execution.createTask({
    name: "Ok",
    kind: "INVOKE",
    runtimeId: rt.id,
  });
  execution.execute(okTask.id);
  const failTask = execution.createTask({
    name: "Fail",
    kind: "PROBE",
    runtimeId: rt.id,
  });
  execution.execute(failTask.id, {
    handler: () => {
      throw new Error("boom");
    },
  });
  // After fail, runtime may be SUSPENDED — recreate for later probes if needed
  const rt2 = createRuntime({
    id: "e11.verify.obs.rt2",
    name: "Obs RT2",
    kind: "WORKER",
  });
  registerCreatedRuntime(rt2);
  startRuntime(rt2.id);

  const gov = createGovernanceManager({ managerId: "e11-p5-gov" });
  gov.initialize();
  gov.start();
  gov.registerResource({
    id: "e11.verify.obs.cpu",
    name: "Obs CPU",
    type: "CPU",
    capacity: 10,
    runtimeId: rt2.id,
    tenantId: tenant.id,
  });
  gov.allocate({
    resourceId: "e11.verify.obs.cpu",
    tenantId: tenant.id,
    amount: 9,
    priority: "HIGH",
  });

  const obs = createObservabilityManager({ managerId: "e11-p5-verify" });
  check(obs.initialize().status === "READY", "obs ready");
  check(obs.start().status === "RUNNING", "obs running");

  obs.emit({
    kind: "LIFECYCLE",
    severity: "INFO",
    message: "observe lifecycle",
    source: "verify",
    runtimeId: rt2.id,
    tenantId: tenant.id,
  });
  const fromCtx = obs.emitFromContext(ctx.contextId, {
    kind: "TENANT",
    message: "from tenant context",
    source: "verify",
  });
  check(fromCtx.tenantId === tenant.id, "context tenant");
  check(fromCtx.organizationId === org.id, "context org");

  obs.recordTelemetry({
    name: "custom.gauge",
    type: "GAUGE",
    value: 1,
    tenantId: tenant.id,
  });
  obs.recordAudit({
    action: "ADMIT",
    actor: "verify",
    target: "e11.verify.obs.cpu",
    tenantId: tenant.id,
  });

  const traces = obs.collectExecutionTraces();
  check(traces.length >= 1, "execution telemetry");
  const govTel = obs.collectGovernance();
  check(govTel.length >= 1, "governance telemetry");

  const health = obs.health();
  check(health.runtimeCount >= 1, "health runtimes");

  const anomalies = obs.detectAnomalies({
    utilizationThreshold: 0.5,
    failureSpikeMin: 1,
    quotaPressureRatio: 0.5,
  });
  check(anomalies.length >= 1, "anomalies detected");

  const metrics = obs.metrics();
  check(metrics.eventCount >= 2, "metrics events");
  check(metrics.auditCount >= 1, "metrics audits");
  check(metrics.executionTraceCount >= 1, "metrics traces");
  check(metrics.anomalyCount >= 1, "metrics anomalies");

  const manifest = getObservabilityRegistryManifest();
  check(manifest.base === E11_OBSERVABILITY_BASE, "manifest base");

  obs.stop();
  gov.stop();
  execution.stop();
  cleanup();
  console.log("✓ event / telemetry / audit / health / anomaly / metrics");
}

function testSignoff() {
  const gate = checkE11P5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P5ReleaseGatePass(gate);
  console.log("✓ observability release gate");
}

function main() {
  console.log("E11-P5 Cloud Runtime Observability Layer verify");
  checkModules();
  checkConstants();
  testObservabilityStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
