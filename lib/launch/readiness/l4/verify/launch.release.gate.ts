/**
 * Launch L4 — Enterprise Delivery Validation Release Gate
 * BASE: enterprise-launch-l3-production-hardening-v1
 * Isolated namespace — does not mutate E01–E12 or commercialization layers
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../../l1/demo/demo.constants";
import { LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID } from "../../l2/pilot/pilot.constants";
import {
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
} from "../../l3/runtime/runtime.constants";
import {
  ARTIFACT_VERIFY_RESULTS,
  DELIVERY_ACCEPTANCE_VERDICTS,
  DELIVERY_STATUSES,
  L4_MANAGER_STATUSES,
  L4_READINESS_VERDICTS,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
  LAUNCH_L4_VALIDATION_FREEZE_VERSION,
  SCENARIO_KINDS,
  VALIDATION_CHECK_RESULTS,
  WORKFLOW_STEP_STATUSES,
} from "../scenario/scenario.constants";
import {
  assertL4DeliveryValidationReadinessReady,
  clearL4DeliveryValidationLayer,
  createL4DeliveryValidationManager,
  getL4RegistryManifest,
} from "../validation.manager";

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

export const LAUNCH_L4_SIGNOFF_VERSION = "launch-l4-signoff-1" as const;

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
  clearL4DeliveryValidationLayer();
}

export function checkLaunchL4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "L4-CONSTANTS",
      "validation",
      "L4 enterprise delivery validation version constants",
      LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID ===
        "enterprise-launch-l4-enterprise-delivery-validation-v1" &&
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION === "launch-l4-1" &&
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE ===
          LAUNCH_L3_PRODUCTION_HARDENING_ID &&
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE ===
          "enterprise-launch-l3-production-hardening-v1" &&
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION ===
          "launch-l4-enterprise-delivery-validation-freeze-1" &&
        LAUNCH_L4_VALIDATION_FREEZE_VERSION ===
          "launch-l4-enterprise-delivery-validation-freeze-1" &&
        SCENARIO_KINDS.length === 4 &&
        WORKFLOW_STEP_STATUSES.length === 4 &&
        VALIDATION_CHECK_RESULTS.length === 3 &&
        ARTIFACT_VERIFY_RESULTS.length === 3 &&
        DELIVERY_ACCEPTANCE_VERDICTS.length === 4 &&
        DELIVERY_STATUSES.length === 5 &&
        L4_READINESS_VERDICTS.length === 3 &&
        L4_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID} base=${LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "L4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "L4-L3-BASE",
      "hardening",
      "L3 production hardening freeze preserved as BASE",
      LAUNCH_L3_PRODUCTION_HARDENING_ID ===
        "enterprise-launch-l3-production-hardening-v1" &&
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE ===
          LAUNCH_L3_PRODUCTION_HARDENING_ID &&
        LAUNCH_L3_HARDENING_FREEZE_VERSION ===
          "launch-l3-production-hardening-freeze-1" &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
          "enterprise-launch-l2-pilot-customer-flow-v1" &&
        LAUNCH_L1_DEMO_FOUNDATION_ID ===
          "enterprise-launch-l1-demo-foundation-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `l3=${LAUNCH_L3_PRODUCTION_HARDENING_ID}`,
    ),
  );

  checks.push(
    check(
      "L4-UPSTREAM",
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
    const mgr = createL4DeliveryValidationManager({
      managerId: "launch-l4-gate",
    });
    mgr.initialize();
    mgr.start();

    const scenario = mgr.registerScenario({
      id: "l4.gate.scenario",
      name: "Enterprise Cutover UAT",
      kind: "UAT",
      owner: "delivery.lead",
    });
    const workflow = mgr.createWorkflow({
      id: "l4.gate.workflow",
      scenarioId: scenario.id,
      name: "UAT Workflow",
      stepLabels: ["Prepare", "Execute", "Signoff"],
    });
    mgr.advanceStep({
      workflowId: workflow.id,
      stepIndex: 0,
      status: "COMPLETED",
    });
    mgr.advanceStep({
      workflowId: workflow.id,
      stepIndex: 1,
      status: "COMPLETED",
    });

    mgr.runCheck({
      id: "l4.gate.chk1",
      scenarioId: scenario.id,
      name: "API smoke",
      component: "runtime",
      result: "PASS",
    });
    mgr.runCheck({
      id: "l4.gate.chk2",
      scenarioId: scenario.id,
      name: "Security gate",
      component: "security",
      result: "PASS",
    });
    const validation = mgr.evaluateValidation({
      id: "l4.gate.result",
      scenarioId: scenario.id,
    });

    const artifact = mgr.registerArtifact({
      id: "l4.gate.artifact",
      scenarioId: scenario.id,
      name: "Cutover checklist",
    });
    mgr.verifyArtifact({
      id: "l4.gate.verify",
      artifactId: artifact.id,
      result: "VALID",
    });
    const report = mgr.generateReport({
      id: "l4.gate.report",
      scenarioId: scenario.id,
    });

    const acceptance = mgr.acceptDelivery({
      id: "l4.gate.acc",
      scenarioId: scenario.id,
      verdict: "ACCEPTED",
      score: 96,
      notes: "Enterprise delivery accepted",
    });
    mgr.updateStatus({
      id: "l4.gate.status",
      scenarioId: scenario.id,
      status: "ACCEPTED",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getL4RegistryManifest();

    const ok =
      validation.verdict === "PASS" &&
      report.validCount >= 1 &&
      acceptance.verdict === "ACCEPTED" &&
      readiness.verdict === "READY" &&
      registry.foundationId ===
        LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID &&
      registry.base === LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE &&
      registry.scenarioCount >= 1 &&
      registry.workflowCount >= 1 &&
      registry.stepCount >= 3 &&
      registry.checkCount >= 2 &&
      registry.validationResultCount >= 1 &&
      registry.artifactCount >= 1 &&
      registry.reportCount >= 1 &&
      registry.acceptanceCount >= 1 &&
      registry.statusCount >= 1;

    try {
      assertL4DeliveryValidationReadinessReady(readiness);
      checks.push(
        check(
          "L4-STACK",
          "validation",
          "Scenario / workflow / validation / artifact / delivery / readiness",
          ok,
          `validation=${validation.verdict} acceptance=${acceptance.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "L4-STACK",
          "validation",
          "Scenario / workflow / validation / artifact / delivery / readiness",
          false,
          error instanceof Error
            ? error.message
            : "l4 enterprise delivery validation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "L4-STACK",
        "validation",
        "Scenario / workflow / validation / artifact / delivery / readiness",
        false,
        error instanceof Error
          ? error.message
          : "l4 enterprise delivery validation probe failed",
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
      `launch-l4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchL4ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchL4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch L4 release gate failed: ${gate.summary}`);
  }
}
