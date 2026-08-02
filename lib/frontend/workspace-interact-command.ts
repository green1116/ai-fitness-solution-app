/**
 * FEAT-40 — Work in AI Workspace (ACT-04-01 / WorkspaceInteract).
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

export const FEAT_40_ID = "FEAT-40" as const;
export const FEAT_40_ACTION_ID = "ACT-04-01" as const;
export const FEAT_40_COMMAND = "WorkspaceInteract" as const;
export const FEAT_40_INT_ID = "INT-WS-CONVERSE" as const;

export type WorkspaceInteractResult = Readonly<{
  featId: typeof FEAT_40_ID;
  actionId: typeof FEAT_40_ACTION_ID;
  command: typeof FEAT_40_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  message: string;
  projectId: string;
  requestUrl: string;
  httpMethod: "GET";
  summaryPresent: boolean;
  httpInvoked: true;
  navigationOnly: false;
  localOnly: false;
}>;

/**
 * Plan + invoke WorkspaceInteract through the existing ACT-04-01 binding.
 * Nearest surface is GET /api/workspace/summary — no chat API invented.
 */
export async function runWorkspaceInteractCommand(input: {
  message: string;
  projectId?: string;
  fetchImpl?: typeof fetch;
}): Promise<WorkspaceInteractResult> {
  const message = input.message.trim();
  if (!message) throw new Error("Message is required");

  const projectId = (input.projectId ?? "").trim();
  const plan = planCommandFlow({
    actionId: FEAT_40_ACTION_ID,
    localDraft: projectId ? { projectId } : undefined,
  });

  if (plan.command !== FEAT_40_COMMAND) {
    throw new Error(
      `FEAT-40 expects command ${FEAT_40_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error("FEAT-40 WorkspaceInteract must require HTTP command flow");
  }
  if (plan.navigateTo !== null) {
    throw new Error("FEAT-40 WorkspaceInteract must not be navigation-only");
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error("FEAT-40 WorkspaceInteract missing existing-api transport");
  }
  if (plan.binding?.actionId !== FEAT_40_ACTION_ID) {
    throw new Error("FEAT-40 must reuse ACT-04-01 adapter binding");
  }

  beginAdapterMeta(createIdleMetaState());

  const qs = new URLSearchParams(plan.transport.requestView);
  const requestUrl = qs.toString()
    ? `${plan.transport.routeRef}?${qs.toString()}`
    : plan.transport.routeRef;

  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to continue workspace interaction",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "WorkspaceInteract failed"),
      { settle, plan, httpInvoked: true as const, localOnly: false as const },
    );
  }

  const wire = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const summaryPresent = Boolean(
    wire &&
      typeof wire === "object" &&
      (wire.summary || wire.ok === true || wire.currentProject || wire.projectsCount != null),
  );

  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: null,
    empty: !summaryPresent,
  });

  return {
    featId: FEAT_40_ID,
    actionId: FEAT_40_ACTION_ID,
    command: FEAT_40_COMMAND,
    plan,
    settle,
    message,
    projectId,
    requestUrl,
    httpMethod: "GET",
    summaryPresent,
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-06 / verify scripts. */
export function assertWorkspaceInteractBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_40_ACTION_ID });
  if (
    plan.command !== FEAT_40_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== null ||
    plan.transport.mode !== "existing-api"
  ) {
    throw new Error("AC-GP01-06 binding not ready for WorkspaceInteract");
  }
  return plan;
}
