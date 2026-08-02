/**
 * FEAT-11 — Provide Planning Inputs (ACT-02-02 / SubmitPlanningInputs).
 * Reuses PD-2.4 adapter binding + presentation-adapter plan; invokes existing API only.
 */
import {
  beginAdapterMeta,
  buildRequestView,
  planCommandFlow,
  settleAdapterFailure,
  settleAdapterSuccess,
  type AdapterFlowPlan,
  type AdapterSettleResult,
} from "@/lib/frontend/presentation-adapter";
import { createIdleMetaState } from "@/lib/frontend/presentation-state";

export const FEAT_11_ID = "FEAT-11" as const;
export const FEAT_11_ACTION_ID = "ACT-02-02" as const;
export const FEAT_11_COMMAND = "SubmitPlanningInputs" as const;
export const FEAT_11_INT_ID = "INT-INTAKE-INPUT" as const;

/** SCR-02 presentation fields (PD-2.3 / AC-GP01-04). */
export type PlanningInputsDraft = Readonly<{
  companySize: string;
  location: string;
  space: string;
  budget: string;
  goals: string;
}>;

/** Nearest existing budget/calculate contract (PD-2.4). */
export type SubmitPlanningInputsBody = Readonly<{
  quoteId: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  organizationId: string;
}>;

export type SubmitPlanningInputsResult = Readonly<{
  featId: typeof FEAT_11_ID;
  actionId: typeof FEAT_11_ACTION_ID;
  command: typeof FEAT_11_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  submittedInputs: PlanningInputsDraft;
  requestBody: SubmitPlanningInputsBody;
  budgetId: string;
  httpInvoked: true;
  navigationOnly: false;
  localOnly: false;
}>;

function requireField(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

/** Presentation cue → positive int for nearest companySize field (no feasibility check). */
export function mapCompanySizeCue(raw: string): number {
  const match = raw.replace(/,/g, "").match(/\d+/);
  if (!match) return 1;
  const n = Number.parseInt(match[0]!, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 1_000_000);
}

/** Presentation budget cue → nearest budgetTier (no pricing validation). */
export function mapBudgetTierCue(raw: string): "low" | "mid" | "high" {
  const t = raw.trim().toLowerCase();
  if (/(^|\b)(low|basic|entry|small)(\b|$)/.test(t)) return "low";
  if (/(^|\b)(high|premium|enterprise|large)(\b|$)/.test(t)) return "high";
  if (/(^|\b)(mid|medium|standard)(\b|$)/.test(t)) return "mid";
  return "mid";
}

export function buildSubmitPlanningInputsBody(
  draft: PlanningInputsDraft,
  cues?: Readonly<{ quoteId?: string; organizationId?: string }>,
): SubmitPlanningInputsBody {
  requireField(draft.companySize, "Company size");
  requireField(draft.location, "Location");
  requireField(draft.space, "Space");
  requireField(draft.budget, "Budget");
  requireField(draft.goals, "Goals");

  return {
    quoteId: (cues?.quoteId ?? "").trim() || `quote-plan-${Date.now()}`,
    companySize: mapCompanySizeCue(draft.companySize),
    budgetTier: mapBudgetTierCue(draft.budget),
    organizationId:
      (cues?.organizationId ?? "").trim() || `org-plan-${Date.now()}`,
  };
}

/**
 * Plan + invoke SubmitPlanningInputs through the existing ACT-02-02 binding.
 * Not local-only / navigation-only — requires HTTP to binding.existingApi.
 */
export async function runSubmitPlanningInputsCommand(input: {
  draft: PlanningInputsDraft;
  quoteId?: string;
  organizationId?: string;
  fetchImpl?: typeof fetch;
}): Promise<SubmitPlanningInputsResult> {
  const draft: PlanningInputsDraft = {
    companySize: input.draft.companySize.trim(),
    location: input.draft.location.trim(),
    space: input.draft.space.trim(),
    budget: input.draft.budget.trim(),
    goals: input.draft.goals.trim(),
  };

  const plan = planCommandFlow({
    actionId: FEAT_11_ACTION_ID,
    localDraft: {
      goalCue: draft.goals,
      scopeText: [draft.location, draft.space, draft.budget]
        .filter(Boolean)
        .join(" | "),
    },
  });

  if (plan.command !== FEAT_11_COMMAND) {
    throw new Error(
      `FEAT-11 expects command ${FEAT_11_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error(
      "FEAT-11 SubmitPlanningInputs must require HTTP command flow",
    );
  }
  if (plan.navigateTo !== null) {
    throw new Error(
      "FEAT-11 SubmitPlanningInputs must not be navigation-only",
    );
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error(
      "FEAT-11 SubmitPlanningInputs missing existing-api transport",
    );
  }
  if (plan.binding?.actionId !== FEAT_11_ACTION_ID) {
    throw new Error("FEAT-11 must reuse ACT-02-02 adapter binding");
  }

  const requestView = buildRequestView(FEAT_11_ACTION_ID, {
    goalCue: draft.goals,
    scopeText: [draft.location, draft.space, draft.budget]
      .filter(Boolean)
      .join(" | "),
  });
  if (!requestView.goalCue) {
    throw new Error("FEAT-11 goals must flow through adapter request view");
  }

  beginAdapterMeta(createIdleMetaState());

  const requestBody = buildSubmitPlanningInputsBody(draft, {
    quoteId: input.quoteId,
    organizationId: input.organizationId,
  });

  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(plan.transport.routeRef, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to submit planning inputs",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "SubmitPlanningInputs failed"),
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

  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: null,
    empty: !budgetId,
  });

  return {
    featId: FEAT_11_ID,
    actionId: FEAT_11_ACTION_ID,
    command: FEAT_11_COMMAND,
    plan,
    settle,
    submittedInputs: draft,
    requestBody,
    budgetId,
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-04 / verify scripts. */
export function assertSubmitPlanningInputsBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_11_ACTION_ID });
  if (
    plan.command !== FEAT_11_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== null ||
    plan.transport.mode !== "existing-api"
  ) {
    throw new Error("AC-GP01-04 binding not ready for SubmitPlanningInputs");
  }
  return plan;
}
