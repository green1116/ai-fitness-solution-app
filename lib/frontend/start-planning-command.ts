/**
 * FEAT-10 — Start Fitness Space Planning (ACT-02-01 / StartPlanning).
 * Reuses PD-2.4 adapter binding + presentation-adapter plan; invokes existing API only.
 */
import {
  beginAdapterMeta,
  planCommandFlow,
  settleAdapterFailure,
  settleAdapterSuccess,
  type AdapterFlowPlan,
  type AdapterSettleResult,
} from "@/lib/frontend/presentation-adapter";
import { createIdleMetaState } from "@/lib/frontend/presentation-state";

export const FEAT_10_ID = "FEAT-10" as const;
export const FEAT_10_ACTION_ID = "ACT-02-01" as const;
export const FEAT_10_COMMAND = "StartPlanning" as const;
export const FEAT_10_INT_ID = "INT-INTAKE-START" as const;

/** Nearest existing tenant/run bootstrap contract (PD-2.4). */
export type StartPlanningBootstrap = Readonly<{
  organizationName: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  adminEmail: string;
}>;

export type StartPlanningCommandResult = Readonly<{
  featId: typeof FEAT_10_ID;
  actionId: typeof FEAT_10_ACTION_ID;
  command: typeof FEAT_10_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  organizationId: string;
  workspaceId: string;
  httpInvoked: true;
  navigationOnly: false;
}>;

function defaultBootstrap(): StartPlanningBootstrap {
  return {
    organizationName: `Fitness Space Planning ${Date.now()}`,
    plan: "BASIC",
    adminEmail: "planning.start@local.test",
  };
}

/**
 * Plan + invoke StartPlanning through the existing ACT-02-01 binding.
 * Not navigation-only — requires HTTP to binding.existingApi.
 */
export async function runStartPlanningCommand(input?: {
  bootstrap?: Partial<StartPlanningBootstrap>;
  fetchImpl?: typeof fetch;
}): Promise<StartPlanningCommandResult> {
  const plan = planCommandFlow({ actionId: FEAT_10_ACTION_ID });

  if (plan.command !== FEAT_10_COMMAND) {
    throw new Error(
      `FEAT-10 expects command ${FEAT_10_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error("FEAT-10 StartPlanning must require HTTP command flow");
  }
  if (plan.navigateTo !== null) {
    throw new Error("FEAT-10 StartPlanning must not be navigation-only");
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error("FEAT-10 StartPlanning missing existing-api transport");
  }
  if (plan.binding?.actionId !== FEAT_10_ACTION_ID) {
    throw new Error("FEAT-10 must reuse ACT-02-01 adapter binding");
  }

  beginAdapterMeta(createIdleMetaState());

  const bootstrap: StartPlanningBootstrap = {
    ...defaultBootstrap(),
    ...input?.bootstrap,
  };
  const fetchImpl = input?.fetchImpl ?? fetch;
  const response = await fetchImpl(plan.transport.routeRef, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(bootstrap),
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to start planning session",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "StartPlanning failed"),
      { settle, plan, httpInvoked: true as const },
    );
  }

  const wire = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const payload =
    wire && typeof wire === "object" && wire.data && typeof wire.data === "object"
      ? (wire.data as Record<string, unknown>)
      : wire;
  const organizationId =
    typeof payload?.organizationId === "string" ? payload.organizationId : "";
  const workspaceId =
    typeof payload?.workspaceId === "string"
      ? payload.workspaceId
      : typeof payload?.projectId === "string"
        ? payload.projectId
        : "";

  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: null,
    empty: !organizationId && !workspaceId,
  });

  return {
    featId: FEAT_10_ID,
    actionId: FEAT_10_ACTION_ID,
    command: FEAT_10_COMMAND,
    plan,
    settle,
    organizationId,
    workspaceId,
    httpInvoked: true,
    navigationOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-03 / verify scripts. */
export function assertStartPlanningBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_10_ACTION_ID });
  if (
    plan.command !== FEAT_10_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== null ||
    plan.transport.mode !== "existing-api"
  ) {
    throw new Error("AC-GP01-03 binding not ready for StartPlanning");
  }
  return plan;
}
