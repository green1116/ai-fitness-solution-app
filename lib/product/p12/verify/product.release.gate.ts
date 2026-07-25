/**
 * Product P12 — Production Launch Release Gate
 * BASE: enterprise-product-p11-commercial-release-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P11_COMMERCIAL_RELEASE_ID } from "../../p11/release/release.constants";
import {
  ADOPTION_LEVELS,
  LAUNCH_STATUSES,
  MONITORING_SEVERITIES,
  OPERATIONS_MODES,
  P12_MANAGER_STATUSES,
  P12_READINESS_VERDICTS,
  PRODUCT_P12_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
  READINESS_GATES,
  ROLLOUT_STRATEGIES,
  SUPPORT_PRIORITIES,
} from "../launch/launch.constants";
import {
  assertP12ProductionLaunchReadinessReady,
  clearP12ProductionLaunchLayer,
  createP12LaunchManager,
  getP12RegistryManifest,
} from "../launch.manager";

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

export const PRODUCT_P12_SIGNOFF_VERSION = "product-p12-signoff-1" as const;

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
  clearP12ProductionLaunchLayer();
}

export function checkProductP12ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P12-CONSTANTS",
      "launch",
      "Product P12 production launch version constants",
      PRODUCT_P12_PRODUCTION_LAUNCH_ID ===
        "enterprise-product-p12-production-launch-v1" &&
        PRODUCT_P12_PRODUCTION_LAUNCH_VERSION === "product-p12-1" &&
        PRODUCT_P12_PRODUCTION_LAUNCH_BASE ===
          PRODUCT_P11_COMMERCIAL_RELEASE_ID &&
        PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION ===
          "product-p12-production-launch-freeze-1" &&
        PRODUCT_P12_LAUNCH_FREEZE_VERSION ===
          "product-p12-production-launch-freeze-1" &&
        LAUNCH_STATUSES.length === 6 &&
        READINESS_GATES.length === 4 &&
        ROLLOUT_STRATEGIES.length === 4 &&
        ADOPTION_LEVELS.length === 5 &&
        OPERATIONS_MODES.length === 4 &&
        MONITORING_SEVERITIES.length === 4 &&
        SUPPORT_PRIORITIES.length === 4 &&
        P12_READINESS_VERDICTS.length === 3 &&
        P12_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P12_PRODUCTION_LAUNCH_ID} base=${PRODUCT_P12_PRODUCTION_LAUNCH_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P12-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P12-P11-BASE",
      "product-p11",
      "P11 commercial release BASE preserved",
      PRODUCT_P12_PRODUCTION_LAUNCH_BASE ===
        "enterprise-product-p11-commercial-release-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P12_PRODUCTION_LAUNCH_BASE}`,
    ),
  );

  checks.push(
    check(
      "P12-UPSTREAM",
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
    const mgr = createP12LaunchManager({ managerId: "prod-p12-gate" });
    mgr.initialize();
    mgr.start();

    const launch = mgr.createLaunch({
      id: "p12.gate.lch",
      commercialReleaseRef: "p11.gate.rel",
      name: "Acme Production Launch",
      owner: "launch.ops",
    });
    mgr.updateLaunchStatus({
      launchId: launch.id,
      status: "READY_CHECK",
    });
    mgr.recordReadiness({
      id: "p12.gate.rdy",
      launchId: launch.id,
      name: "Commercial release live",
      gate: "PASS",
      evidence: "p11 commercial release LIVE",
    });
    mgr.updateLaunchStatus({
      launchId: launch.id,
      status: "ROLLING_OUT",
    });
    const rollout = mgr.startRollout({
      id: "p12.gate.rlt",
      launchId: launch.id,
      strategy: "PHASED",
      percent: 25,
      cohorts: ["pilot-sites"],
    });
    mgr.advanceRollout({
      rolloutId: rollout.id,
      percent: 100,
      complete: true,
    });
    mgr.recordAdoption({
      id: "p12.gate.ado",
      launchId: launch.id,
      segment: "coach-seats",
      level: "ACTIVE",
      activeUsers: 42,
    });
    mgr.activateOperations({
      id: "p12.gate.ops",
      launchId: launch.id,
      mode: "HYPERCARE",
      owner: "sre.lead",
      runbook: "Week-1 hypercare checklist",
    });
    mgr.recordMonitoring({
      id: "p12.gate.mon",
      launchId: launch.id,
      metric: "error_rate",
      severity: "INFO",
      value: 0.2,
      message: "Error rate within SLO",
    });
    const support = mgr.openSupportCase({
      id: "p12.gate.sup",
      launchId: launch.id,
      title: "Coach onboarding question",
      priority: "P3",
      owner: "support.queue",
    });
    mgr.closeSupportCase({
      caseId: support.id,
    });
    mgr.updateLaunchStatus({
      launchId: launch.id,
      status: "LIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP12RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P12_PRODUCTION_LAUNCH_ID &&
      registry.base === PRODUCT_P12_PRODUCTION_LAUNCH_BASE &&
      registry.launchCount >= 1 &&
      registry.readinessCount >= 1 &&
      registry.rolloutCount >= 1 &&
      registry.adoptionCount >= 1 &&
      registry.operationsCount >= 1 &&
      registry.monitoringCount >= 1 &&
      registry.supportCount >= 1;

    try {
      assertP12ProductionLaunchReadinessReady(readiness);
      checks.push(
        check(
          "P12-STACK",
          "launch",
          "Launch / readiness / rollout / adoption / operations / monitoring / support",
          ok,
          `readiness=${readiness.verdict} rollouts=${registry.rolloutCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P12-STACK",
          "launch",
          "Launch / readiness / rollout / adoption / operations / monitoring / support",
          false,
          error instanceof Error
            ? error.message
            : "p12 production launch not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P12-STACK",
        "launch",
        "Launch / readiness / rollout / adoption / operations / monitoring / support",
        false,
        error instanceof Error
          ? error.message
          : "p12 production launch probe failed",
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
      `product-p12-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP12ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP12ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P12 release gate failed: ${gate.summary}`);
  }
}
