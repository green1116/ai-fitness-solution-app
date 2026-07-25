/**
 * Product P1 — Customer onboarding readiness
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { listActivations } from "../activation/activation.state";
import { listOnboardingChecklists } from "../checklist/checklist.tracker";
import { listCustomerIntakes } from "../customer/customer.intake";
import { listCustomerProfiles } from "../customer/customer.profile";
import { listWorkspaces } from "../workspace/workspace.setup";
import { PRODUCT_P1_CUSTOMER_ONBOARDING_BASE } from "./onboarding.constants";
import { listOnboardingPlans } from "./onboarding.registry";
import { listOnboardingWorkflowEvents } from "./onboarding.workflow";
import type { P1ReadinessCheck, P1ReadinessResult } from "./onboarding.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P1ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP1CustomerOnboardingReadiness(): P1ReadinessResult {
  const checks: P1ReadinessCheck[] = [];

  checks.push(
    check(
      "P1-BASE",
      "foundation",
      "Operations complete baseline aligned",
      PRODUCT_P1_CUSTOMER_ONBOARDING_BASE ===
        ENTERPRISE_OPERATIONS_COMPLETE_ID,
      `base=${PRODUCT_P1_CUSTOMER_ONBOARDING_BASE}`,
    ),
  );

  const profiles = listCustomerProfiles();
  checks.push(
    check(
      "P1-PROF",
      "customer",
      "Customer profiles present",
      profiles.length >= 1,
      `profiles=${profiles.length}`,
    ),
  );

  const intakes = listCustomerIntakes();
  checks.push(
    check(
      "P1-INT",
      "customer",
      "Customer intakes present",
      intakes.length >= 1,
      `intakes=${intakes.length}`,
    ),
  );

  const plans = listOnboardingPlans();
  checks.push(
    check(
      "P1-PLAN",
      "onboarding",
      "Onboarding plans present",
      plans.length >= 1,
      `plans=${plans.length}`,
    ),
  );

  const workflows = listOnboardingWorkflowEvents();
  checks.push(
    check(
      "P1-WF",
      "onboarding",
      "Onboarding workflow events present",
      workflows.length >= 1,
      `workflows=${workflows.length}`,
    ),
  );

  const workspaces = listWorkspaces();
  checks.push(
    check(
      "P1-WS",
      "workspace",
      "Workspaces present",
      workspaces.length >= 1,
      `workspaces=${workspaces.length}`,
    ),
  );

  const checklists = listOnboardingChecklists();
  const checklistOk =
    checklists.length >= 1 &&
    checklists.some((c) =>
      c.items
        .filter((i) => i.required)
        .every((i) => i.status === "PASSED" || i.status === "SKIPPED"),
    );
  checks.push(
    check(
      "P1-CHK",
      "checklist",
      "Required checklist items satisfied",
      checklistOk,
      `checklists=${checklists.length}`,
    ),
  );

  const activations = listActivations();
  checks.push(
    check(
      "P1-ACT",
      "activation",
      "Activation records present",
      activations.some((a) => a.state === "ACTIVE"),
      `activations=${activations.length}`,
    ),
  );

  const completed = plans.some((p) => p.status === "COMPLETED");
  checks.push(
    check(
      "P1-DONE",
      "onboarding",
      "Onboarding plan completed",
      completed,
      `completed=${completed}`,
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
    summary: `p1-customer-onboarding readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP1CustomerOnboardingReadinessReady(
  result: P1ReadinessResult,
): asserts result is P1ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p1 customer onboarding not ready: ${result.summary}`,
    );
  }
}
