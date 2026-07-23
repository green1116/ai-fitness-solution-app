/**
 * Commercialization P5 — Delivery Operations Foundation Release Gate
 * BASE: enterprise-commercialization-p4-customer-onboarding-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or P1–P4 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../../p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../../p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../../p3/pricing/pricing.constants";
import {
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
} from "../../p4/onboarding/onboarding.constants";
import {
  ACCEPTANCE_VERDICTS,
  ARTIFACT_KINDS,
  ARTIFACT_STATUSES,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
  COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
  DELIVERY_OPS_MANAGER_STATUSES,
  DELIVERY_OPS_READINESS_VERDICTS,
  DELIVERY_PHASES,
  DELIVERY_STATUSES,
  EXECUTION_STATUSES,
  PROJECT_STATUSES,
  QUALITY_CHECK_KINDS,
} from "../delivery/delivery.constants";
import {
  assertDeliveryOpsReadinessReady,
  clearDeliveryOpsFoundationLayer,
  createDeliveryOpsFoundationManager,
  getDeliveryOpsRegistryManifest,
} from "../delivery.manager";

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

export const COMMERCIALIZATION_P5_SIGNOFF_VERSION =
  "commercialization-p5-signoff-1" as const;

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
  clearDeliveryOpsFoundationLayer();
}

export function checkCommercializationP5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P5-CONSTANTS",
      "delivery-ops",
      "Delivery operations version constants",
      COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
        "enterprise-commercialization-p5-delivery-operations-foundation-v1" &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION ===
          "commercialization-p5-1" &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE ===
          COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE ===
          "enterprise-commercialization-p4-customer-onboarding-foundation-v1" &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION ===
          "commercialization-delivery-operations-foundation-freeze-1" &&
        COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION ===
          "commercialization-p5-delivery-operations-foundation-freeze-1" &&
        PROJECT_STATUSES.length === 5 &&
        DELIVERY_STATUSES.length === 5 &&
        DELIVERY_PHASES.length === 5 &&
        EXECUTION_STATUSES.length === 5 &&
        ARTIFACT_KINDS.length === 5 &&
        ARTIFACT_STATUSES.length === 4 &&
        QUALITY_CHECK_KINDS.length === 4 &&
        ACCEPTANCE_VERDICTS.length === 3 &&
        DELIVERY_OPS_READINESS_VERDICTS.length === 3 &&
        DELIVERY_OPS_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_DELIVERY_OPERATIONS_ID} base=${COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P5-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P5-P4-BASE",
      "onboarding",
      "P4 onboarding freeze preserved as BASE",
      COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
        "enterprise-commercialization-p4-customer-onboarding-foundation-v1" &&
        COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE ===
          COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID &&
        COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION ===
          "commercialization-p4-customer-onboarding-foundation-freeze-1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_ID ===
          "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
          "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_ID ===
          "enterprise-commercialization-p1-sales-foundation-v1",
      `p4=${COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P5-UPSTREAM",
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
    const mgr = createDeliveryOpsFoundationManager({
      managerId: "comm-p5-gate",
    });
    mgr.initialize();
    mgr.start();

    const project = mgr.registerProject({
      id: "comm.p5.gate.project",
      name: "Acme Delivery Project",
      accountRef: "comm.p4.gate.account",
      workspaceRef: "comm.p4.gate.ws",
      owner: "delivery-lead",
    });
    mgr.transitionProject({
      id: "comm.p5.gate.plife",
      projectId: project.id,
      status: "ACTIVE",
      reason: "kickoff approved",
    });

    const delivery = mgr.registerDelivery({
      id: "comm.p5.gate.delivery",
      projectId: project.id,
      name: "Acme Go-Live Delivery",
    });
    mgr.advanceWorkflow({
      id: "comm.p5.gate.wf1",
      deliveryId: delivery.id,
      phase: "KICKOFF",
    });

    const execution = mgr.startExecution({
      id: "comm.p5.gate.exec",
      deliveryId: delivery.id,
      name: "Provisioning Run",
    });
    mgr.recordExecutionStatus({
      id: "comm.p5.gate.estat1",
      executionId: execution.id,
      status: "RUNNING",
      progress: 40,
    });
    mgr.recordExecutionStatus({
      id: "comm.p5.gate.estat2",
      executionId: execution.id,
      status: "SUCCEEDED",
      progress: 100,
    });

    const artifact = mgr.registerArtifact({
      id: "comm.p5.gate.art",
      projectId: project.id,
      deliveryId: delivery.id,
      name: "Cutover Runbook",
      kind: "DOCUMENT",
      version: "1.0.0",
    });
    mgr.trackArtifact({
      id: "comm.p5.gate.track",
      artifactId: artifact.id,
      toStatus: "PUBLISHED",
      event: "publish",
    });

    mgr.runQualityCheck({
      id: "comm.p5.gate.q1",
      deliveryId: delivery.id,
      kind: "FUNCTIONAL",
      name: "Smoke suite",
      score: 92,
    });
    mgr.runQualityCheck({
      id: "comm.p5.gate.q2",
      deliveryId: delivery.id,
      kind: "SECURITY",
      name: "Access review",
      score: 88,
    });
    const acceptance = mgr.recordAcceptance({
      id: "comm.p5.gate.acc",
      deliveryId: delivery.id,
      verdict: "ACCEPTED",
      acceptedBy: "acme-sponsor",
      notes: "accepted for production",
    });

    mgr.advanceWorkflow({
      id: "comm.p5.gate.wf2",
      deliveryId: delivery.id,
      phase: "BUILD",
    });
    mgr.advanceWorkflow({
      id: "comm.p5.gate.wf3",
      deliveryId: delivery.id,
      phase: "VALIDATE",
    });
    mgr.advanceWorkflow({
      id: "comm.p5.gate.wf4",
      deliveryId: delivery.id,
      phase: "RELEASE",
    });
    mgr.advanceWorkflow({
      id: "comm.p5.gate.wf5",
      deliveryId: delivery.id,
      phase: "CLOSEOUT",
    });
    mgr.transitionProject({
      id: "comm.p5.gate.plife2",
      projectId: project.id,
      status: "COMPLETED",
      reason: "delivery closed",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getDeliveryOpsRegistryManifest();

    const ok =
      acceptance.qualityPassRate >= 70 &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_DELIVERY_OPERATIONS_ID &&
      registry.base === COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE &&
      registry.projectCount >= 1 &&
      registry.deliveryCount >= 1 &&
      registry.workflowCount >= 1 &&
      registry.executionCount >= 1 &&
      registry.statusCount >= 1 &&
      registry.artifactCount >= 1 &&
      registry.trackingCount >= 1 &&
      registry.qualityCount >= 1 &&
      registry.acceptanceCount >= 1;

    try {
      assertDeliveryOpsReadinessReady(readiness);
      checks.push(
        check(
          "COM-P5-STACK",
          "delivery-ops",
          "Project / delivery / execution / artifact / quality / readiness",
          ok,
          `passRate=${acceptance.qualityPassRate}% readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P5-STACK",
          "delivery-ops",
          "Project / delivery / execution / artifact / quality / readiness",
          false,
          error instanceof Error
            ? error.message
            : "delivery-ops foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P5-STACK",
        "delivery-ops",
        "Project / delivery / execution / artifact / quality / readiness",
        false,
        error instanceof Error
          ? error.message
          : "delivery-ops foundation probe failed",
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
      `commercialization-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP5ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P5 release gate failed: ${gate.summary}`,
    );
  }
}
