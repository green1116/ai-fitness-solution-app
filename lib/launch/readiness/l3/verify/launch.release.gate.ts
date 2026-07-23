/**
 * Launch L3 — Production Hardening Release Gate
 * BASE: enterprise-launch-l2-pilot-customer-flow-v1
 * Isolated namespace — does not mutate E01–E12 or commercialization layers
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../../l1/demo/demo.constants";
import {
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
} from "../../l2/pilot/pilot.constants";
import {
  ALERT_SEVERITIES,
  AUDIT_EVENT_KINDS,
  BACKUP_STATUSES,
  HEALTH_LEVELS,
  L3_MANAGER_STATUSES,
  L3_READINESS_VERDICTS,
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
  METRIC_KINDS,
  RUNTIME_STATUSES,
  SECURITY_CHECK_RESULTS,
  SECURITY_POLICY_SCOPES,
} from "../runtime/runtime.constants";
import {
  assertL3HardeningReadinessReady,
  clearL3ProductionHardeningLayer,
  createL3ProductionHardeningManager,
  getL3RegistryManifest,
} from "../hardening.manager";

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

export const LAUNCH_L3_SIGNOFF_VERSION = "launch-l3-signoff-1" as const;

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
  clearL3ProductionHardeningLayer();
}

export function checkLaunchL3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "L3-CONSTANTS",
      "hardening",
      "L3 production hardening version constants",
      LAUNCH_L3_PRODUCTION_HARDENING_ID ===
        "enterprise-launch-l3-production-hardening-v1" &&
        LAUNCH_L3_PRODUCTION_HARDENING_VERSION === "launch-l3-1" &&
        LAUNCH_L3_PRODUCTION_HARDENING_BASE ===
          LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID &&
        LAUNCH_L3_PRODUCTION_HARDENING_BASE ===
          "enterprise-launch-l2-pilot-customer-flow-v1" &&
        LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION ===
          "launch-l3-production-hardening-freeze-1" &&
        LAUNCH_L3_HARDENING_FREEZE_VERSION ===
          "launch-l3-production-hardening-freeze-1" &&
        RUNTIME_STATUSES.length === 4 &&
        HEALTH_LEVELS.length === 4 &&
        SECURITY_POLICY_SCOPES.length === 4 &&
        SECURITY_CHECK_RESULTS.length === 3 &&
        METRIC_KINDS.length === 4 &&
        ALERT_SEVERITIES.length === 3 &&
        AUDIT_EVENT_KINDS.length === 4 &&
        BACKUP_STATUSES.length === 4 &&
        L3_READINESS_VERDICTS.length === 3 &&
        L3_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_L3_PRODUCTION_HARDENING_ID} base=${LAUNCH_L3_PRODUCTION_HARDENING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "L3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "L3-L2-BASE",
      "pilot-flow",
      "L2 pilot customer flow freeze preserved as BASE",
      LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
        "enterprise-launch-l2-pilot-customer-flow-v1" &&
        LAUNCH_L3_PRODUCTION_HARDENING_BASE ===
          LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID &&
        LAUNCH_L2_PILOT_FREEZE_VERSION ===
          "launch-l2-pilot-customer-flow-freeze-1" &&
        LAUNCH_L1_DEMO_FOUNDATION_ID ===
          "enterprise-launch-l1-demo-foundation-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `l2=${LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID}`,
    ),
  );

  checks.push(
    check(
      "L3-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createL3ProductionHardeningManager({
      managerId: "launch-l3-gate",
    });
    mgr.initialize();
    mgr.start();

    const runtime = mgr.registerRuntime({
      id: "l3.gate.runtime",
      name: "Acme Prod Runtime",
      environment: "production",
    });
    mgr.updateRuntimeStatus({
      runtimeId: runtime.id,
      status: "HEALTHY",
    });
    const health = mgr.assessHealth({
      id: "l3.gate.health",
      runtimeId: runtime.id,
      checksPassed: 9,
      checksFailed: 1,
    });

    const policy = mgr.definePolicy({
      id: "l3.gate.policy",
      runtimeId: runtime.id,
      name: "Auth hardening",
      scope: "AUTH",
    });
    mgr.runSecurityCheck({
      id: "l3.gate.sec",
      policyId: policy.id,
      name: "MFA enforced",
      result: "PASS",
    });

    const metric = mgr.recordMetric({
      id: "l3.gate.metric",
      runtimeId: runtime.id,
      name: "p95-latency",
      kind: "LATENCY",
      value: 120,
      unit: "ms",
    });
    mgr.raiseAlert({
      id: "l3.gate.alert",
      metricId: metric.id,
      severity: "WARN",
      message: "Latency above baseline",
    });

    mgr.recordAudit({
      id: "l3.gate.aud1",
      runtimeId: runtime.id,
      kind: "SECURITY",
      actor: "sre.lee",
      message: "Policy activated",
    });
    mgr.recordAudit({
      id: "l3.gate.aud2",
      runtimeId: runtime.id,
      kind: "BACKUP",
      actor: "sre.lee",
      message: "Snapshot scheduled",
    });
    mgr.assembleTrail({
      id: "l3.gate.trail",
      runtimeId: runtime.id,
    });

    const snap = mgr.captureSnapshot({
      id: "l3.gate.snap",
      runtimeId: runtime.id,
      label: "pre-go-live",
      sizeMb: 256,
    });
    const restore = mgr.restoreBackup({
      id: "l3.gate.restore",
      snapshotId: snap.id,
      targetRuntimeId: runtime.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getL3RegistryManifest();

    const ok =
      health.level === "GREEN" &&
      restore.status === "RESTORED" &&
      readiness.verdict === "READY" &&
      registry.foundationId === LAUNCH_L3_PRODUCTION_HARDENING_ID &&
      registry.base === LAUNCH_L3_PRODUCTION_HARDENING_BASE &&
      registry.runtimeCount >= 1 &&
      registry.healthCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.securityCheckCount >= 1 &&
      registry.metricCount >= 1 &&
      registry.alertCount >= 1 &&
      registry.auditEventCount >= 2 &&
      registry.trailCount >= 1 &&
      registry.snapshotCount >= 1 &&
      registry.restoreCount >= 1;

    try {
      assertL3HardeningReadinessReady(readiness);
      checks.push(
        check(
          "L3-STACK",
          "hardening",
          "Runtime / security / monitoring / audit / backup / readiness",
          ok,
          `health=${health.level} restore=${restore.status} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "L3-STACK",
          "hardening",
          "Runtime / security / monitoring / audit / backup / readiness",
          false,
          error instanceof Error
            ? error.message
            : "l3 production hardening not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "L3-STACK",
        "hardening",
        "Runtime / security / monitoring / audit / backup / readiness",
        false,
        error instanceof Error
          ? error.message
          : "l3 production hardening probe failed",
      ),
    );
    cleanup();
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
      `launch-l3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchL3ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchL3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch L3 release gate failed: ${gate.summary}`);
  }
}
