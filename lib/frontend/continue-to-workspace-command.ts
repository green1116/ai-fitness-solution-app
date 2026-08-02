/**
 * FEAT-12 — Continue to AI Workspace (ACT-02-03 / ContinueToWorkspace).
 * Reuses PD-2.4 NAV binding; requires ACT-02-02 inputs accepted.
 */
import { planCommandFlow, type AdapterFlowPlan } from "@/lib/frontend/presentation-adapter";
import {
  arePlanningInputsAccepted,
  clearPlanningInputsAccepted,
  markPlanningInputsAccepted,
} from "@/lib/frontend/planning-intake-session";

export const FEAT_12_ID = "FEAT-12" as const;
export const FEAT_12_ACTION_ID = "ACT-02-03" as const;
export const FEAT_12_COMMAND = "ContinueToWorkspace" as const;
export const FEAT_12_INT_ID = "INT-FORWARD-PRIMARY" as const;
export const FEAT_12_PREREQUISITE_ACTION = "ACT-02-02" as const;

export type ContinueToWorkspaceResult = Readonly<{
  featId: typeof FEAT_12_ID;
  actionId: typeof FEAT_12_ACTION_ID;
  command: typeof FEAT_12_COMMAND;
  plan: AdapterFlowPlan;
  navigateTo: "/workspace";
  prerequisiteMet: true;
  unconditionalNavigation: false;
}>;

/**
 * Plan ContinueToWorkspace only when planning inputs have been accepted.
 * Reuses existing navigateTo "/workspace" — no invented routes.
 */
export function runContinueToWorkspaceCommand(): ContinueToWorkspaceResult {
  if (!arePlanningInputsAccepted()) {
    throw new Error(
      "ACT-02-03 requires ACT-02-02 planning inputs accepted",
    );
  }

  const plan = planCommandFlow({ actionId: FEAT_12_ACTION_ID });

  if (plan.command !== FEAT_12_COMMAND) {
    throw new Error(
      `FEAT-12 expects command ${FEAT_12_COMMAND}, got ${plan.command}`,
    );
  }
  if (plan.flow !== "nav" || plan.requiresHttp) {
    throw new Error("FEAT-12 ContinueToWorkspace must use NAV binding");
  }
  if (plan.navigateTo !== "/workspace") {
    throw new Error(
      `FEAT-12 must reuse navigateTo "/workspace", got ${plan.navigateTo}`,
    );
  }
  if (plan.binding?.actionId !== FEAT_12_ACTION_ID) {
    throw new Error("FEAT-12 must reuse ACT-02-03 adapter binding");
  }

  return {
    featId: FEAT_12_ID,
    actionId: FEAT_12_ACTION_ID,
    command: FEAT_12_COMMAND,
    plan,
    navigateTo: "/workspace",
    prerequisiteMet: true,
    unconditionalNavigation: false,
  };
}

/** Synchronous binding check for AC-GP01-05 / verify scripts. */
export function assertContinueToWorkspaceBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_12_ACTION_ID });
  if (
    plan.command !== FEAT_12_COMMAND ||
    plan.flow !== "nav" ||
    plan.navigateTo !== "/workspace" ||
    plan.requiresHttp
  ) {
    throw new Error("AC-GP01-05 binding not ready for ContinueToWorkspace");
  }
  return plan;
}

/** Test helpers — do not use as Domain API. */
export const __planningIntakeSessionForTests = {
  markAccepted: markPlanningInputsAccepted,
  clearAccepted: clearPlanningInputsAccepted,
  isAccepted: arePlanningInputsAccepted,
};
