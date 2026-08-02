/**
 * FEAT-14 — Continue to Budget (ACT-05-05 / ContinueToBudget).
 * Reuses PD-2.4 API+NAV binding; invokes existing budget calculate then navigates SCR-06.
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

export const FEAT_14_ID = "FEAT-14" as const;
export const CONTINUE_TO_BUDGET_ACTION_ID = "ACT-05-05" as const;
export const CONTINUE_TO_BUDGET_COMMAND = "ContinueToBudget" as const;
export const CONTINUE_TO_BUDGET_INT_ID = "INT-FORWARD-GROUP" as const;

/** Nearest existing budget/calculate contract (same as FEAT-11 / PD-2.4). */
export type ContinueToBudgetBody = Readonly<{
  quoteId: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  organizationId: string;
}>;

export type ContinueToBudgetResult = Readonly<{
  featId: typeof FEAT_14_ID;
  actionId: typeof CONTINUE_TO_BUDGET_ACTION_ID;
  command: typeof CONTINUE_TO_BUDGET_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  requestUrl: string;
  requestBody: ContinueToBudgetBody;
  budgetId: string;
  navigateTo: "/budget";
  navigateHref: string;
  httpMethod: "POST";
  httpInvoked: true;
  navigationOnly: false;
  localOnly: false;
}>;

export function buildContinueToBudgetBody(
  projectId: string,
): ContinueToBudgetBody {
  const cue = projectId.trim();
  const stamp = Date.now();
  return {
    quoteId: cue || `quote-budget-${stamp}`,
    companySize: 1,
    budgetTier: "mid",
    organizationId: cue ? `org-${cue}` : `org-budget-${stamp}`,
  };
}

/**
 * Plan + invoke ContinueToBudget through the existing ACT-05-05 binding.
 * HTTP POST /api/v80/budget/calculate, then navigateTo /budget (API+NAV).
 */
export async function runContinueToBudgetCommand(input?: {
  projectId?: string;
  fetchImpl?: typeof fetch;
}): Promise<ContinueToBudgetResult> {
  const projectId = (input?.projectId ?? "").trim();
  const plan = planCommandFlow({
    actionId: CONTINUE_TO_BUDGET_ACTION_ID,
    localDraft: projectId ? { projectId } : undefined,
  });

  if (plan.command !== CONTINUE_TO_BUDGET_COMMAND) {
    throw new Error(
      `FEAT-14 expects command ${CONTINUE_TO_BUDGET_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error(
      "FEAT-14 ContinueToBudget must require HTTP command flow",
    );
  }
  if (plan.navigateTo !== "/budget") {
    throw new Error(
      `FEAT-14 must reuse navigateTo "/budget", got ${plan.navigateTo}`,
    );
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error(
      "FEAT-14 ContinueToBudget missing existing-api transport",
    );
  }
  if (plan.binding?.actionId !== CONTINUE_TO_BUDGET_ACTION_ID) {
    throw new Error("FEAT-14 must reuse ACT-05-05 adapter binding");
  }
  if (plan.binding.kind !== "API+NAV") {
    throw new Error(
      "FEAT-14 ContinueToBudget must be API+NAV (not NAV-only)",
    );
  }

  beginAdapterMeta(createIdleMetaState());

  const requestUrl = plan.transport.routeRef;
  const requestBody = buildContinueToBudgetBody(projectId);
  const fetchImpl = input?.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to continue to budget",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "ContinueToBudget failed"),
      { settle, plan, httpInvoked: true as const, localOnly: false as const },
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
  const budgetId =
    typeof payload?.budgetId === "string" ? payload.budgetId : "";

  const navigateHref = buildProjectScopedHref("/budget", projectId);
  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: "/budget",
    empty: !budgetId,
  });

  return {
    featId: FEAT_14_ID,
    actionId: CONTINUE_TO_BUDGET_ACTION_ID,
    command: CONTINUE_TO_BUDGET_COMMAND,
    plan,
    settle,
    requestUrl,
    requestBody,
    budgetId,
    navigateTo: "/budget",
    navigateHref,
    httpMethod: "POST",
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-10 / verify scripts. */
export function assertContinueToBudgetBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: CONTINUE_TO_BUDGET_ACTION_ID });
  if (
    plan.command !== CONTINUE_TO_BUDGET_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== "/budget" ||
    plan.transport.mode !== "existing-api" ||
    plan.binding?.kind !== "API+NAV"
  ) {
    throw new Error("AC-GP01-10 binding not ready for ContinueToBudget");
  }
  return plan;
}
