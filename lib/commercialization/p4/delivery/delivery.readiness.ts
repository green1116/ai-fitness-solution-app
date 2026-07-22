/**
 * Commercialization P4 — Delivery / onboarding readiness
 */

import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../../p3/pricing/pricing.constants";
import { listAccountLifecycleRecords } from "../account/account.lifecycle";
import { listCustomerAccounts } from "../account/account.registry";
import { listCustomerIntakes } from "../customer/customer.intake";
import { listCustomerProfiles } from "../customer/customer.profile";
import { listCustomerRequirements } from "../customer/customer.requirements";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE } from "../onboarding/onboarding.constants";
import { listOnboardingPlans } from "../onboarding/onboarding.registry";
import { listOnboardingWorkflowEvents } from "../onboarding/onboarding.workflow";
import { listCustomerWorkspaces } from "../workspace/workspace.registry";
import { listWorkspaceSetups } from "../workspace/workspace.setup";
import { listDeliveryHandoffs } from "./delivery.handoff";
import type {
  OnboardingReadinessCheck,
  OnboardingReadinessResult,
} from "./delivery.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OnboardingReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateOnboardingFoundationReadiness(): OnboardingReadinessResult {
  const checks: OnboardingReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P4-BASE",
      "foundation",
      "P3 pricing-contract baseline aligned",
      COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE ===
        COMMERCIALIZATION_PRICING_CONTRACT_ID,
      `base=${COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  const accounts = listCustomerAccounts();
  checks.push(
    check(
      "COM-P4-ACCOUNT",
      "account",
      "Customer accounts registered",
      accounts.length >= 1,
      `accounts=${accounts.length}`,
    ),
  );

  const lifecycles = listAccountLifecycleRecords();
  checks.push(
    check(
      "COM-P4-ALIFE",
      "account",
      "Account lifecycle transitions present",
      lifecycles.length >= 1,
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const intakes = listCustomerIntakes();
  checks.push(
    check(
      "COM-P4-INTAKE",
      "customer",
      "Customer intake recorded",
      intakes.length >= 1,
      `intakes=${intakes.length}`,
    ),
  );

  const profiles = listCustomerProfiles();
  checks.push(
    check(
      "COM-P4-PROFILE",
      "customer",
      "Customer profiles present",
      profiles.length >= 1,
      `profiles=${profiles.length}`,
    ),
  );

  const requirements = listCustomerRequirements();
  checks.push(
    check(
      "COM-P4-REQ",
      "customer",
      "Customer requirements captured",
      requirements.length >= 1,
      `requirements=${requirements.length}`,
    ),
  );

  const plans = listOnboardingPlans();
  checks.push(
    check(
      "COM-P4-ONB",
      "onboarding",
      "Onboarding plans registered",
      plans.length >= 1,
      `plans=${plans.length}`,
    ),
  );

  const workflow = listOnboardingWorkflowEvents();
  checks.push(
    check(
      "COM-P4-WF",
      "onboarding",
      "Onboarding workflow events present",
      workflow.length >= 1,
      `events=${workflow.length}`,
    ),
  );

  const workspaces = listCustomerWorkspaces();
  const readyWs = workspaces.filter(
    (w) => w.status === "READY" || w.status === "LIVE",
  );
  checks.push(
    check(
      "COM-P4-WS",
      "workspace",
      "Ready workspaces present",
      readyWs.length >= 1,
      `ready=${readyWs.length}`,
    ),
  );

  const setups = listWorkspaceSetups();
  checks.push(
    check(
      "COM-P4-SETUP",
      "workspace",
      "Workspace setups present",
      setups.length >= 1,
      `setups=${setups.length}`,
    ),
  );

  const handoffs = listDeliveryHandoffs();
  checks.push(
    check(
      "COM-P4-HAND",
      "delivery",
      "Delivery handoffs present",
      handoffs.length >= 1,
      `handoffs=${handoffs.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `onboarding foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOnboardingFoundationReadinessReady(
  result: OnboardingReadinessResult,
): asserts result is OnboardingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`onboarding foundation not ready: ${result.summary}`);
  }
}
