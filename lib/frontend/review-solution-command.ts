/**
 * FEAT-13 — Review Planning Solution (ACT-05-01 / ReviewSolution).
 * Reuses PD-2.4 adapter binding; invokes existing plan PDF surface on SCR-05.
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

export const FEAT_13_ID = "FEAT-13" as const;
export const REVIEW_SOLUTION_ACTION_ID = "ACT-05-01" as const;
export const REVIEW_SOLUTION_COMMAND = "ReviewSolution" as const;
export const REVIEW_SOLUTION_INT_ID = "INT-RESULT-REVIEW" as const;

/** Presentation review cue mapped from existing plan PDF response. */
export type SolutionReviewView = Readonly<{
  projectId: string;
  contentType: string;
  byteLength: number;
  statusLabel: string;
  planningLabel: string;
  configurationLabel: string;
}>;

export type ReviewSolutionResult = Readonly<{
  featId: typeof FEAT_13_ID;
  actionId: typeof REVIEW_SOLUTION_ACTION_ID;
  command: typeof REVIEW_SOLUTION_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  review: SolutionReviewView;
  requestUrl: string;
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
 * Plan + invoke ReviewSolution through the existing ACT-05-01 binding.
 * Existing surface: GET /api/v80/pdf?type=plan — no PDF layout recalculation.
 */
export async function runReviewSolutionCommand(input?: {
  projectId?: string;
  fetchImpl?: typeof fetch;
}): Promise<ReviewSolutionResult> {
  const projectId = (input?.projectId ?? "").trim();
  const plan = planCommandFlow({
    actionId: REVIEW_SOLUTION_ACTION_ID,
    localDraft: projectId ? { projectId } : undefined,
  });

  if (plan.command !== REVIEW_SOLUTION_COMMAND) {
    throw new Error(
      `FEAT-13 ReviewSolution expects command ${REVIEW_SOLUTION_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error("FEAT-13 ReviewSolution must require HTTP command flow");
  }
  if (plan.navigateTo !== null) {
    throw new Error("FEAT-13 ReviewSolution must not be navigation-only");
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error("FEAT-13 ReviewSolution missing existing-api transport");
  }
  if (plan.binding?.actionId !== REVIEW_SOLUTION_ACTION_ID) {
    throw new Error("FEAT-13 ReviewSolution must reuse ACT-05-01 adapter binding");
  }
  if (plan.binding.kind !== "API") {
    throw new Error("FEAT-13 ReviewSolution must use API binding");
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
      message: "Unable to review planning solution",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "ReviewSolution failed"),
      { settle, plan, httpInvoked: true as const, localOnly: false as const },
    );
  }

  const buffer = await response.arrayBuffer().catch(() => new ArrayBuffer(0));
  const contentType =
    response.headers.get("Content-Type")?.split(";")[0]?.trim() ||
    "application/pdf";
  const resolvedProjectId =
    new URL(requestUrl, "http://local.invalid").searchParams.get("projectId") ||
    projectId;

  const review: SolutionReviewView = {
    projectId: resolvedProjectId,
    contentType,
    byteLength: buffer.byteLength,
    statusLabel: "Planning solution ready for review",
    planningLabel: "Space plan and planning overview loaded from plan artifact",
    configurationLabel:
      "Configuration summary available from the reviewed solution artifact",
  };

  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: null,
    empty: buffer.byteLength === 0,
  });

  return {
    featId: FEAT_13_ID,
    actionId: REVIEW_SOLUTION_ACTION_ID,
    command: REVIEW_SOLUTION_COMMAND,
    plan,
    settle,
    review,
    requestUrl,
    httpMethod: "GET",
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-09 / verify scripts. */
export function assertReviewSolutionBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: REVIEW_SOLUTION_ACTION_ID });
  if (
    plan.command !== REVIEW_SOLUTION_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== null ||
    plan.transport.mode !== "existing-api" ||
    plan.binding?.kind !== "API"
  ) {
    throw new Error("AC-GP01-09 binding not ready for ReviewSolution");
  }
  return plan;
}
