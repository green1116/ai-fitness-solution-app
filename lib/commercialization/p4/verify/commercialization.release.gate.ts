/**
 * Commercialization P4 — Customer Onboarding Foundation Release Gate
 * BASE: enterprise-commercialization-p3-pricing-contract-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or P1–P3 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../../p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../../p2/tier/tier.constants";
import {
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
} from "../../p3/pricing/pricing.constants";
import {
  ACCOUNT_STATUSES,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
  HANDOFF_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_READINESS_VERDICTS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  REQUIREMENT_PRIORITIES,
  WORKSPACE_STATUSES,
} from "../onboarding/onboarding.constants";
import {
  assertOnboardingFoundationReadinessReady,
  clearOnboardingFoundationLayer,
  createOnboardingFoundationManager,
  getOnboardingRegistryManifest,
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

export const COMMERCIALIZATION_P4_SIGNOFF_VERSION =
  "commercialization-p4-signoff-1" as const;

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
  clearOnboardingFoundationLayer();
}

export function checkCommercializationP4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P4-CONSTANTS",
      "onboarding",
      "Customer onboarding version constants",
      COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
        "enterprise-commercialization-p4-customer-onboarding-foundation-v1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION ===
          "commercialization-p4-1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE ===
          COMMERCIALIZATION_PRICING_CONTRACT_ID &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE ===
          "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
          "commercialization-customer-onboarding-foundation-freeze-1" &&
        COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION ===
          "commercialization-p4-customer-onboarding-foundation-freeze-1" &&
        ACCOUNT_STATUSES.length === 5 &&
        ONBOARDING_STATUSES.length === 5 &&
        ONBOARDING_STEPS.length === 5 &&
        WORKSPACE_STATUSES.length === 4 &&
        INTAKE_CHANNELS.length === 4 &&
        REQUIREMENT_PRIORITIES.length === 4 &&
        HANDOFF_STATUSES.length === 4 &&
        ONBOARDING_READINESS_VERDICTS.length === 3 &&
        ONBOARDING_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID} base=${COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P4-P3-BASE",
      "pricing",
      "P3 pricing-contract freeze preserved as BASE",
      COMMERCIALIZATION_PRICING_CONTRACT_ID ===
        "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE ===
          COMMERCIALIZATION_PRICING_CONTRACT_ID &&
        COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION ===
          "commercialization-p3-pricing-contract-foundation-freeze-1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
          "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_ID ===
          "enterprise-commercialization-p1-sales-foundation-v1",
      `p3=${COMMERCIALIZATION_PRICING_CONTRACT_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P4-UPSTREAM",
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
    const mgr = createOnboardingFoundationManager({
      managerId: "comm-p4-gate",
    });
    mgr.initialize();
    mgr.start();

    const account = mgr.registerAccount({
      id: "comm.p4.gate.account",
      name: "Acme Fitness Account",
      customerRef: "acme-fitness",
      contractRef: "comm.p3.gate.contract",
      owner: "csm-1",
    });
    mgr.transitionAccount({
      id: "comm.p4.gate.alife",
      accountId: account.id,
      status: "PROVISIONING",
      reason: "onboarding kickoff",
    });
    mgr.recordIntake({
      id: "comm.p4.gate.intake",
      accountId: account.id,
      channel: "SALES",
      sourceRef: account.contractRef,
      notes: "enterprise pilot intake",
    });
    mgr.createProfile({
      id: "comm.p4.gate.profile",
      accountId: account.id,
      displayName: "Acme Fitness Co",
      industry: "FITNESS",
      companySize: "ENTERPRISE",
      primaryContact: "ops@acme.test",
    });
    const req = mgr.captureRequirement({
      id: "comm.p4.gate.req",
      accountId: account.id,
      title: "SSO required",
      priority: "P1",
      description: "SAML SSO before go-live",
    });
    mgr.satisfyRequirement(req.id);

    const onboarding = mgr.registerOnboarding({
      id: "comm.p4.gate.onb",
      accountId: account.id,
      name: "Acme Onboarding Plan",
    });
    mgr.advanceWorkflow({
      id: "comm.p4.gate.wf1",
      onboardingId: onboarding.id,
      step: "INTAKE",
      note: "intake complete",
    });
    mgr.advanceWorkflow({
      id: "comm.p4.gate.wf2",
      onboardingId: onboarding.id,
      step: "REQUIREMENTS",
    });
    mgr.advanceWorkflow({
      id: "comm.p4.gate.wf3",
      onboardingId: onboarding.id,
      step: "WORKSPACE",
    });

    const workspace = mgr.registerWorkspace({
      id: "comm.p4.gate.ws",
      accountId: account.id,
      name: "Acme Production",
      slug: "acme-prod",
      region: "US_EAST",
    });
    const setup = mgr.setupWorkspace({
      id: "comm.p4.gate.setup",
      workspaceId: workspace.id,
    });

    const handoff = mgr.createHandoff({
      id: "comm.p4.gate.hand",
      accountId: account.id,
      onboardingId: onboarding.id,
      workspaceId: workspace.id,
      recipient: "delivery-team",
      notes: "ready for delivery",
    });
    mgr.acceptHandoff(handoff.id);
    mgr.completeHandoff(handoff.id);
    mgr.goLiveWorkspace(workspace.id);
    mgr.advanceWorkflow({
      id: "comm.p4.gate.wf4",
      onboardingId: onboarding.id,
      step: "HANDOFF",
    });
    mgr.advanceWorkflow({
      id: "comm.p4.gate.wf5",
      onboardingId: onboarding.id,
      step: "GO_LIVE",
    });
    mgr.transitionAccount({
      id: "comm.p4.gate.alife2",
      accountId: account.id,
      status: "ACTIVE",
      reason: "go-live complete",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getOnboardingRegistryManifest();

    const ok =
      setup.setupScore >= 60 &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID &&
      registry.base === COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE &&
      registry.accountCount >= 1 &&
      registry.onboardingCount >= 1 &&
      registry.workflowCount >= 1 &&
      registry.workspaceCount >= 1 &&
      registry.setupCount >= 1 &&
      registry.profileCount >= 1 &&
      registry.requirementCount >= 1 &&
      registry.intakeCount >= 1 &&
      registry.handoffCount >= 1;

    try {
      assertOnboardingFoundationReadinessReady(readiness);
      checks.push(
        check(
          "COM-P4-STACK",
          "onboarding",
          "Account / intake / workspace / handoff / readiness",
          ok,
          `setup=${setup.setupScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P4-STACK",
          "onboarding",
          "Account / intake / workspace / handoff / readiness",
          false,
          error instanceof Error
            ? error.message
            : "onboarding foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P4-STACK",
        "onboarding",
        "Account / intake / workspace / handoff / readiness",
        false,
        error instanceof Error
          ? error.message
          : "onboarding foundation probe failed",
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
      `commercialization-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP4ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P4 release gate failed: ${gate.summary}`,
    );
  }
}
