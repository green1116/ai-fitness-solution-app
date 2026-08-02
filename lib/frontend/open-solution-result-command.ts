/**
 * FEAT-13 — Open Solution Result (ACT-04-06 / OpenSolutionResult).
 * Reuses PD-2.4 API+NAV binding; invokes existing plan PDF surface then navigates SCR-05.
 */
import {
  beginAdapterMeta,
  planCommandFlow,
  settleAdapterFailure,
  settleAdapterSuccess,
  type AdapterFlowPlan,
  type AdapterSettleResult,
} from "@/lib/frontend/presentation-adapter";
import { buildProjectScopedHref } from "@/lib/frontend/navigation";
import { createIdleMetaState } from "@/lib/frontend/presentation-state";

export const FEAT_13_ID = "FEAT-13" as const;
export const FEAT_13_ACTION_ID = "ACT-04-06" as const;
export const FEAT_13_COMMAND = "OpenSolutionResult" as const;
export const FEAT_13_INT_ID = "INT-WS-OUTCOME" as const;

export type OpenSolutionResultCommandResult = Readonly<{
  featId: typeof FEAT_13_ID;
  actionId: typeof FEAT_13_ACTION_ID;
  command: typeof FEAT_13_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  requestUrl: string;
  navigateTo: "/solution";
  navigateHref: string;
  httpMethod: "GET";
  httpInvoked: true;
  navigationOnly: false;
  localOnly: false;
}>;

function buildPdfRequestUrl(routeRef: string, projectId: string): string {
  const url = new URL(routeRef, "http://local.invalid");
  if (projectId) url.searchParams.set("projectId", projectId);
  else if (!url.searchParams.get("projectId")) {
    url.searchParams.set("projectId", `plan-${Date.now()}`);
  }
  return `${url.pathname}${url.search}`;
}

/**
 * Plan + invoke OpenSolutionResult through the existing ACT-04-06 binding.
 * HTTP to /api/v80/pdf?type=plan, then navigateTo /solution (API+NAV).
 */
export async function runOpenSolutionResultCommand(input?: {
  projectId?: string;
  fetchImpl?: typeof fetch;
}): Promise<OpenSolutionResultCommandResult> {
  const projectId = (input?.projectId ?? "").trim();
  const plan = planCommandFlow({
    actionId: FEAT_13_ACTION_ID,
    localDraft: projectId ? { projectId } : undefined,
  });

  if (plan.command !== FEAT_13_COMMAND) {
    throw new Error(
      `FEAT-13 expects command ${FEAT_13_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error(
      "FEAT-13 OpenSolutionResult must require HTTP command flow",
    );
  }
  if (plan.navigateTo !== "/solution") {
    throw new Error(
      `FEAT-13 must reuse navigateTo "/solution", got ${plan.navigateTo}`,
    );
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error(
      "FEAT-13 OpenSolutionResult missing existing-api transport",
    );
  }
  if (plan.binding?.actionId !== FEAT_13_ACTION_ID) {
    throw new Error("FEAT-13 must reuse ACT-04-06 adapter binding");
  }
  if (plan.binding.kind !== "API+NAV") {
    throw new Error("FEAT-13 OpenSolutionResult must be API+NAV (not NAV-only)");
  }

  beginAdapterMeta(createIdleMetaState());

  const requestUrl = buildPdfRequestUrl(plan.transport.routeRef, projectId);
  const fetchImpl = input?.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "GET",
    headers: { Accept: "application/pdf, application/json" },
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to open solution result",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "OpenSolutionResult failed"),
      { settle, plan, httpInvoked: true as const, localOnly: false as const },
    );
  }

  // Consume body so transport completes (PDF binary or JSON).
  await response.arrayBuffer().catch(() => null);

  const navigateHref = buildProjectScopedHref("/solution", projectId);
  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: "/solution",
    empty: false,
  });

  return {
    featId: FEAT_13_ID,
    actionId: FEAT_13_ACTION_ID,
    command: FEAT_13_COMMAND,
    plan,
    settle,
    requestUrl,
    navigateTo: "/solution",
    navigateHref,
    httpMethod: "GET",
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-08 / verify scripts. */
export function assertOpenSolutionResultBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_13_ACTION_ID });
  if (
    plan.command !== FEAT_13_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== "/solution" ||
    plan.transport.mode !== "existing-api" ||
    plan.binding?.kind !== "API+NAV"
  ) {
    throw new Error("AC-GP01-08 binding not ready for OpenSolutionResult");
  }
  return plan;
}
