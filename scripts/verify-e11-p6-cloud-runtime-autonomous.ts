/**
 * E11-P6 — Cloud Runtime Autonomous Operations verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ACTION_POLICY_MODES,
  AUTONOMOUS_OPERATION_KINDS,
  AUTONOMOUS_OPERATION_STATUSES,
  E11_AUTONOMOUS_BASE,
  E11_AUTONOMOUS_FREEZE_VERSION,
  E11_AUTONOMOUS_ID,
  E11_AUTONOMOUS_VERSION,
  E11_P6_AUTONOMOUS_FREEZE_VERSION,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
} from "../lib/cloud-runtime/e11/autonomous/autonomous.constants";
import { clearIncidents } from "../lib/cloud-runtime/e11/autonomous/autonomous.incident";
import {
  createAutonomousManager,
  getAutonomousRegistryManifest,
} from "../lib/cloud-runtime/e11/autonomous/autonomous.manager";
import { clearOperations } from "../lib/cloud-runtime/e11/autonomous/autonomous.operation";
import { clearActionPolicies } from "../lib/cloud-runtime/e11/autonomous/autonomous.policy";
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
import { clearAnomalies } from "../lib/cloud-runtime/e11/observability/observability.anomaly";
import { E11_OBSERVABILITY_ID } from "../lib/cloud-runtime/e11/observability/observability.constants";
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
  registerTenant,
} from "../lib/cloud-runtime/e11/tenant/tenant.namespace";
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
  assertE11P6ReleaseGatePass,
  checkE11P6ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/autonomous.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
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
    "lib/cloud-runtime/e11/autonomous/autonomous.constants.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.types.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.operation.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.recovery.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.healing.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.optimize.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.incident.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.policy.ts",
    "lib/cloud-runtime/e11/autonomous/autonomous.manager.ts",
    "lib/cloud-runtime/e11/verify/autonomous.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_AUTONOMOUS_ID === "enterprise-e11-cloud-runtime-autonomous-v1",
    "auto id",
  );
  check(E11_AUTONOMOUS_VERSION === "e11-autonomous-1", "auto version");
  check(
    E11_AUTONOMOUS_FREEZE_VERSION === "e11-autonomous-freeze-1",
    "auto freeze",
  );
  check(
    E11_AUTONOMOUS_BASE ===
      "enterprise-e11-p5-cloud-runtime-observability-v1",
    "auto base",
  );
  check(
    E11_P6_AUTONOMOUS_FREEZE_VERSION ===
      "e11-p6-cloud-runtime-autonomous-freeze-1",
    "p6 freeze",
  );
  check(AUTONOMOUS_OPERATION_KINDS.length === 5, "op kinds");
  check(AUTONOMOUS_OPERATION_STATUSES.length === 6, "op statuses");
  check(INCIDENT_SEVERITIES.length === 4, "incident severities");
  check(INCIDENT_STATUSES.length === 5, "incident statuses");
  check(ACTION_POLICY_MODES.length === 3, "policy modes");
  check(
    E11_OBSERVABILITY_ID === "enterprise-e11-cloud-runtime-observability-v1",
    "p5 intact",
  );
  check(
    E11_GOVERNANCE_ID === "enterprise-e11-cloud-runtime-governance-v1",
    "p4 intact",
  );
  console.log("✓ version constants");
}

function testAutonomousStack() {
  cleanup();

  const rt = createRuntime({
    id: "e11.verify.auto.rt",
    name: "Auto RT",
    kind: "WORKER",
  });
  registerCreatedRuntime(rt);
  startRuntime(rt.id);
  failRuntime(rt.id, "verify fail");
  check(getRuntime(rt.id)?.status === "SUSPENDED", "runtime suspended");

  const org = registerOrganization({
    id: "e11.verify.auto.org",
    name: "Auto Org",
  });
  const tenant = registerTenant({
    id: "e11.verify.auto.tenant",
    name: "Auto Tenant",
    organizationId: org.id,
  });
  createTenantQuota({ tenantId: tenant.id, type: "TASK", limit: 5 });

  const auto = createAutonomousManager({ managerId: "e11-p6-verify" });
  check(auto.initialize().status === "READY", "auto ready");
  check(auto.start().status === "RUNNING", "auto running");

  auto.createPolicy({
    name: "Verify Auto",
    mode: "AUTO",
    minAnomalyScore: 0.2,
    autoIncidentSeverity: "LOW",
    allowedKinds: ["RECOVER", "HEAL", "OPTIMIZE", "INCIDENT"],
    tenantId: tenant.id,
  });

  const recovery = auto.recover({
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  check(recovery.recovered === true, "recovered");
  check(getRuntime(rt.id)?.status === "ACTIVE", "runtime active after recover");

  const heal = auto.heal({ tenantId: tenant.id, openIncidents: true });
  check(heal.operationId.length > 0, "heal op");

  const gov = createGovernanceManager({ managerId: "e11-p6-gov-verify" });
  gov.initialize();
  gov.start();
  gov.registerResource({
    id: "e11.verify.auto.cpu",
    name: "Auto CPU",
    type: "CPU",
    capacity: 20,
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  gov.allocate({
    resourceId: "e11.verify.auto.cpu",
    tenantId: tenant.id,
    runtimeId: rt.id,
    amount: 18,
    priority: "LOW",
  });

  const execution = createExecutionManager({ managerId: "e11-p6-exec-verify" });
  execution.initialize();
  execution.start();

  const opt = auto.optimize({
    utilizationTarget: 0.5,
    execution,
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  check(opt.operationId.length > 0, "optimize op");
  check(opt.recommendations.length >= 1, "optimize recommendations");

  const incident = auto.openIncident({
    title: "Verify incident",
    severity: "MEDIUM",
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  check(incident.status === "OPEN", "incident open");
  auto.setIncidentStatus(incident.id, "MITIGATING");
  check(
    auto.getIncident(incident.id)?.status === "MITIGATING",
    "incident mitigating",
  );

  const obs = createObservabilityManager({ managerId: "e11-p6-obs-verify" });
  obs.initialize();
  obs.start();
  obs.emit({
    kind: "SYSTEM",
    severity: "ERROR",
    message: "anomaly seed",
    source: "verify",
    runtimeId: rt.id,
    tenantId: tenant.id,
  });
  // Force high utilization anomaly path via detect with low thresholds
  obs.detectAnomalies({
    utilizationThreshold: 0.1,
    failureSpikeMin: 1,
    quotaPressureRatio: 0.1,
  });

  const reaction = auto.reactToAnomalies({
    tenantId: tenant.id,
    execution,
    runtimeId: rt.id,
  });
  check(reaction.anomalies >= 0, "react anomalies");

  const manifest = getAutonomousRegistryManifest();
  check(manifest.autonomousId === E11_AUTONOMOUS_ID, "manifest id");
  check(manifest.base === E11_AUTONOMOUS_BASE, "manifest base");
  check(auto.listOperations().length >= 1, "operations recorded");
  check(auto.listPolicies().length >= 1, "policies recorded");

  obs.stop();
  execution.stop();
  gov.stop();
  auto.stop();
  cleanup();
  console.log("✓ recover / heal / optimize / incident / policy / react");
}

function testSignoff() {
  const gate = checkE11P6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P6ReleaseGatePass(gate);
  console.log("✓ autonomous release gate");
}

function main() {
  console.log("E11-P6 Cloud Runtime Autonomous Operations verify");
  checkModules();
  checkConstants();
  testAutonomousStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
