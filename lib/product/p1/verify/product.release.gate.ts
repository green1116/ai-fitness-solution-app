/**
 * Product P1 — Customer Onboarding Release Gate
 * BASE: enterprise-operations-complete-v1
 * Isolated — product implementation only; does not mutate E01–E12 / ops / launch layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import {
  ACTIVATION_STATES,
  CHECKLIST_ITEM_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  P1_MANAGER_STATUSES,
  P1_READINESS_VERDICTS,
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
  PRODUCT_P1_ONBOARDING_FREEZE_VERSION,
  WORKSPACE_STATUSES,
} from "../onboarding/onboarding.constants";
import {
  assertP1CustomerOnboardingReadinessReady,
  clearP1CustomerOnboardingLayer,
  createP1CustomerOnboardingManager,
  getP1RegistryManifest,
} from "../onboarding.manager";

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

export const PRODUCT_P1_SIGNOFF_VERSION = "product-p1-signoff-1" as const;

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
  clearP1CustomerOnboardingLayer();
}

export function checkProductP1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P1-CONSTANTS",
      "onboarding",
      "Product P1 customer onboarding version constants",
      PRODUCT_P1_CUSTOMER_ONBOARDING_ID ===
        "enterprise-product-p1-customer-onboarding-v1" &&
        PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION === "product-p1-1" &&
        PRODUCT_P1_CUSTOMER_ONBOARDING_BASE ===
          ENTERPRISE_OPERATIONS_COMPLETE_ID &&
        PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
          "product-p1-customer-onboarding-freeze-1" &&
        PRODUCT_P1_ONBOARDING_FREEZE_VERSION ===
          "product-p1-customer-onboarding-freeze-1" &&
        ONBOARDING_STATUSES.length === 5 &&
        ONBOARDING_STEPS.length === 6 &&
        INTAKE_CHANNELS.length === 4 &&
        WORKSPACE_STATUSES.length === 4 &&
        CHECKLIST_ITEM_STATUSES.length === 4 &&
        ACTIVATION_STATES.length === 4 &&
        P1_READINESS_VERDICTS.length === 3 &&
        P1_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P1_CUSTOMER_ONBOARDING_ID} base=${PRODUCT_P1_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P1-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P1-OPS-BASE",
      "operations",
      "Operations complete BASE preserved",
      PRODUCT_P1_CUSTOMER_ONBOARDING_BASE ===
        "enterprise-operations-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P1_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  checks.push(
    check(
      "P1-UPSTREAM",
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
    const mgr = createP1CustomerOnboardingManager({
      managerId: "prod-p1-gate",
    });
    mgr.initialize();
    mgr.start();

    const profile = mgr.createProfile({
      id: "p1.gate.profile",
      accountRef: "acme-fitness",
      name: "Acme Fitness",
      owner: "csm.jordan",
    });
    mgr.recordIntake({
      id: "p1.gate.intake",
      profileId: profile.id,
      channel: "SALES",
      summary: "Enterprise gym rollout",
    });
    const plan = mgr.registerPlan({
      id: "p1.gate.plan",
      profileId: profile.id,
    });
    mgr.advanceWorkflow({
      id: "p1.gate.wf.intake",
      onboardingId: plan.id,
      step: "INTAKE",
    });
    mgr.advanceWorkflow({
      id: "p1.gate.wf.profile",
      onboardingId: plan.id,
      step: "PROFILE",
    });
    const workspace = mgr.setupWorkspace({
      id: "p1.gate.ws",
      onboardingId: plan.id,
      name: "Acme Primary Workspace",
    });
    mgr.advanceWorkflow({
      id: "p1.gate.wf.ws",
      onboardingId: plan.id,
      step: "WORKSPACE",
    });
    const checklist = mgr.createChecklist({
      id: "p1.gate.chk",
      onboardingId: plan.id,
    });
    for (const item of checklist.items) {
      mgr.markChecklistItem({
        checklistId: checklist.id,
        key: item.key,
        status: "PASSED",
      });
    }
    mgr.advanceWorkflow({
      id: "p1.gate.wf.chk",
      onboardingId: plan.id,
      step: "CHECKLIST",
    });
    mgr.setActivationState({
      id: "p1.gate.act",
      onboardingId: plan.id,
      state: "PENDING_ACTIVATION",
    });
    mgr.advanceWorkflow({
      id: "p1.gate.wf.act",
      onboardingId: plan.id,
      step: "ACTIVATION",
    });
    mgr.setActivationState({
      onboardingId: plan.id,
      state: "ACTIVE",
      detail: "go-live activated",
    });
    mgr.updateWorkspaceStatus(workspace.id, "LIVE");
    mgr.advanceWorkflow({
      id: "p1.gate.wf.live",
      onboardingId: plan.id,
      step: "GO_LIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP1RegistryManifest();
    const finalPlan = mgr.manifest();

    const ok =
      readiness.verdict === "READY" &&
      finalPlan.planCount >= 1 &&
      registry.foundationId === PRODUCT_P1_CUSTOMER_ONBOARDING_ID &&
      registry.base === PRODUCT_P1_CUSTOMER_ONBOARDING_BASE &&
      registry.profileCount >= 1 &&
      registry.intakeCount >= 1 &&
      registry.workflowCount >= 1 &&
      registry.workspaceCount >= 1 &&
      registry.checklistCount >= 1 &&
      registry.activationCount >= 1;

    try {
      assertP1CustomerOnboardingReadinessReady(readiness);
      checks.push(
        check(
          "P1-STACK",
          "onboarding",
          "Profile / intake / workflow / workspace / checklist / activation",
          ok,
          `readiness=${readiness.verdict} plans=${registry.planCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P1-STACK",
          "onboarding",
          "Profile / intake / workflow / workspace / checklist / activation",
          false,
          error instanceof Error
            ? error.message
            : "p1 customer onboarding not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P1-STACK",
        "onboarding",
        "Profile / intake / workflow / workspace / checklist / activation",
        false,
        error instanceof Error
          ? error.message
          : "p1 customer onboarding probe failed",
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
      `product-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP1ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P1 release gate failed: ${gate.summary}`);
  }
}
