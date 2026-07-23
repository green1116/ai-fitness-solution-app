/**
 * Launch L1 — Demo Foundation Release Gate
 * BASE: enterprise-commercialization-v1-release
 * Isolated namespace — does not mutate E01–E12 or commercialization layers
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import {
  ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
} from "../../../../commercialization/p8/freeze/freeze.lock";
import {
  ARTIFACT_KINDS,
  CUSTOMER_SEGMENTS,
  DEMO_LOAD_STATUSES,
  L1_MANAGER_STATUSES,
  L1_READINESS_VERDICTS,
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
  PROJECT_SCENARIO_KINDS,
  TENANT_STATUSES,
} from "../demo/demo.constants";
import {
  assertL1DemoReadinessReady,
  clearL1DemoFoundationLayer,
  createL1DemoFoundationManager,
  getL1RegistryManifest,
} from "../demo.manager";

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

export const LAUNCH_L1_SIGNOFF_VERSION = "launch-l1-signoff-1" as const;

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
  clearL1DemoFoundationLayer();
}

export function checkLaunchL1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "L1-CONSTANTS",
      "demo",
      "L1 demo foundation version constants",
      LAUNCH_L1_DEMO_FOUNDATION_ID ===
        "enterprise-launch-l1-demo-foundation-v1" &&
        LAUNCH_L1_DEMO_FOUNDATION_VERSION === "launch-l1-1" &&
        LAUNCH_L1_DEMO_FOUNDATION_BASE ===
          "enterprise-commercialization-v1-release" &&
        LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION ===
          "launch-l1-demo-foundation-freeze-1" &&
        LAUNCH_L1_DEMO_FREEZE_VERSION ===
          "launch-l1-demo-foundation-freeze-1" &&
        TENANT_STATUSES.length === 4 &&
        CUSTOMER_SEGMENTS.length === 4 &&
        PROJECT_SCENARIO_KINDS.length === 4 &&
        ARTIFACT_KINDS.length === 4 &&
        DEMO_LOAD_STATUSES.length === 3 &&
        L1_READINESS_VERDICTS.length === 3 &&
        L1_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_L1_DEMO_FOUNDATION_ID} base=${LAUNCH_L1_DEMO_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "L1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "L1-COMM-BASE",
      "commercialization",
      "Commercialization v1 release BASE + complete preserved",
      LAUNCH_L1_DEMO_FOUNDATION_BASE ===
        "enterprise-commercialization-v1-release" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${LAUNCH_L1_DEMO_FOUNDATION_BASE} complete=${ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID}`,
    ),
  );

  checks.push(
    check(
      "L1-UPSTREAM",
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
    const mgr = createL1DemoFoundationManager({
      managerId: "launch-l1-gate",
    });
    mgr.initialize();
    mgr.start();

    const tenant = mgr.registerTenant({
      id: "l1.gate.tenant",
      name: "Acme Demo Tenant",
      region: "us-east-1",
    });
    const customer = mgr.createCustomer({
      id: "l1.gate.customer",
      tenantId: tenant.id,
      displayName: "Acme Fitness",
      segment: "ENTERPRISE",
      contactEmail: "demo@acme.fitness",
    });
    const project = mgr.createProject({
      id: "l1.gate.project",
      tenantId: tenant.id,
      customerId: customer.id,
      name: "Workout Demo Scenario",
      kind: "WORKOUT",
    });
    mgr.registerArtifact({
      id: "l1.gate.artifact",
      projectId: project.id,
      name: "Sample Workout Dataset",
      kind: "DATASET",
    });
    const bundle = mgr.loadDemo({
      id: "l1.gate.bundle",
      tenantId: tenant.id,
      projectId: project.id,
      name: "Acme Demo Bundle",
    });
    mgr.seedDemo({
      id: "l1.gate.seed",
      bundleId: bundle.id,
      label: "seed-workouts",
      payload: { workouts: 12, athletes: 3 },
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getL1RegistryManifest();

    const ok =
      bundle.status === "LOADED" &&
      readiness.verdict === "READY" &&
      registry.foundationId === LAUNCH_L1_DEMO_FOUNDATION_ID &&
      registry.base === LAUNCH_L1_DEMO_FOUNDATION_BASE &&
      registry.tenantCount >= 1 &&
      registry.customerCount >= 1 &&
      registry.projectCount >= 1 &&
      registry.artifactCount >= 1 &&
      registry.bundleCount >= 1 &&
      registry.seedCount >= 1;

    try {
      assertL1DemoReadinessReady(readiness);
      checks.push(
        check(
          "L1-STACK",
          "demo",
          "Tenant / customer / project / artifact / demo / readiness",
          ok,
          `bundle=${bundle.status} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "L1-STACK",
          "demo",
          "Tenant / customer / project / artifact / demo / readiness",
          false,
          error instanceof Error
            ? error.message
            : "l1 demo foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "L1-STACK",
        "demo",
        "Tenant / customer / project / artifact / demo / readiness",
        false,
        error instanceof Error
          ? error.message
          : "l1 demo foundation probe failed",
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
      `launch-l1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchL1ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchL1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch L1 release gate failed: ${gate.summary}`);
  }
}
