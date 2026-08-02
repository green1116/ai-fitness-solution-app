/**
 * FEAT-41 — View Project Context (ACT-04-02 / ViewProjectContext).
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

export const FEAT_41_ID = "FEAT-41" as const;
export const FEAT_41_ACTION_ID = "ACT-04-02" as const;
export const FEAT_41_COMMAND = "ViewProjectContext" as const;
export const FEAT_41_INT_ID = "INT-WS-CONTEXT" as const;

/** Presentation context mapped from existing API response (no Domain invention). */
export type ProjectContextView = Readonly<{
  projectId: string;
  projectLabel: string;
  requirementsLabel: string;
  progressLabel: string;
  documentsCue: string;
}>;

export type ViewProjectContextResult = Readonly<{
  featId: typeof FEAT_41_ID;
  actionId: typeof FEAT_41_ACTION_ID;
  command: typeof FEAT_41_COMMAND;
  plan: AdapterFlowPlan;
  settle: AdapterSettleResult;
  context: ProjectContextView;
  requestUrl: string;
  httpMethod: "GET";
  httpInvoked: true;
  navigationOnly: false;
  localOnly: false;
}>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Map existing workspace/summary (or project) wire → presentation context labels.
 */
export function mapProjectContextResponse(
  wire: unknown,
  projectCue: string,
): ProjectContextView {
  const root = asRecord(wire) ?? {};
  const summary = asRecord(root.summary) ?? root;
  const current = asRecord(summary.currentProject);
  const organization = asRecord(summary.organization);

  const projectId =
    asString(current?.id) ||
    asString(summary.id) ||
    asString(root.projectId) ||
    projectCue;

  const projectLabel =
    asString(current?.name) ||
    asString(summary.name) ||
    asString(organization?.name) ||
    projectId ||
    "No project bound";

  const quotesCount = asNumber(summary.quotesCount);
  const projectsCount = asNumber(summary.projectsCount);
  const reportsCount = asNumber(summary.reportsCount);

  const requirementsLabel =
    quotesCount != null || reportsCount != null
      ? `Quotes ${quotesCount ?? 0} · Reports ${reportsCount ?? 0}`
      : projectId
        ? "Project context loaded"
        : "No requirements visible yet";

  const progressLabel =
    projectsCount != null
      ? `Projects in workspace: ${projectsCount}`
      : projectId
        ? "Workspace task in progress"
        : "No progress visible yet";

  const documentsCue = projectId
    ? "Documents available for this project"
    : "Open a project to browse documents";

  return {
    projectId,
    projectLabel,
    requirementsLabel,
    progressLabel,
    documentsCue,
  };
}

/**
 * Plan + invoke ViewProjectContext through the existing ACT-04-02 binding.
 * Primary existing surface: GET /api/workspace/summary.
 */
export async function runViewProjectContextCommand(input?: {
  projectId?: string;
  fetchImpl?: typeof fetch;
}): Promise<ViewProjectContextResult> {
  const projectId = (input?.projectId ?? "").trim();
  const plan = planCommandFlow({
    actionId: FEAT_41_ACTION_ID,
    localDraft: projectId ? { projectId } : undefined,
  });

  if (plan.command !== FEAT_41_COMMAND) {
    throw new Error(
      `FEAT-41 expects command ${FEAT_41_COMMAND}, got ${plan.command}`,
    );
  }
  if (!plan.requiresHttp || plan.flow !== "command") {
    throw new Error(
      "FEAT-41 ViewProjectContext must require HTTP command flow",
    );
  }
  if (plan.navigateTo !== null) {
    throw new Error("FEAT-41 ViewProjectContext must not be navigation-only");
  }
  if (plan.transport.mode !== "existing-api" || !plan.transport.routeRef) {
    throw new Error(
      "FEAT-41 ViewProjectContext missing existing-api transport",
    );
  }
  if (plan.binding?.actionId !== FEAT_41_ACTION_ID) {
    throw new Error("FEAT-41 must reuse ACT-04-02 adapter binding");
  }

  beginAdapterMeta(createIdleMetaState());

  const qs = new URLSearchParams(plan.transport.requestView);
  const requestUrl = qs.toString()
    ? `${plan.transport.routeRef}?${qs.toString()}`
    : plan.transport.routeRef;

  const fetchImpl = input?.fetchImpl ?? fetch;
  const response = await fetchImpl(requestUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const settle = settleAdapterFailure({
      status: response.status,
      code: String(response.status),
      message: "Unable to load project context",
    });
    throw Object.assign(
      new Error(settle.meta.error ?? "ViewProjectContext failed"),
      { settle, plan, httpInvoked: true as const, localOnly: false as const },
    );
  }

  const wire = (await response.json().catch(() => null)) as unknown;
  const context = mapProjectContextResponse(wire, projectId);
  const empty = !context.projectId && context.projectLabel === "No project bound";

  const settle = settleAdapterSuccess({
    serverKey: plan.serverKey,
    navigateTo: null,
    empty,
  });

  return {
    featId: FEAT_41_ID,
    actionId: FEAT_41_ACTION_ID,
    command: FEAT_41_COMMAND,
    plan,
    settle,
    context,
    requestUrl,
    httpMethod: "GET",
    httpInvoked: true,
    navigationOnly: false,
    localOnly: false,
  };
}

/** Synchronous binding check for AC-GP01-07 / verify scripts. */
export function assertViewProjectContextBindingReady(): AdapterFlowPlan {
  const plan = planCommandFlow({ actionId: FEAT_41_ACTION_ID });
  if (
    plan.command !== FEAT_41_COMMAND ||
    !plan.requiresHttp ||
    plan.navigateTo !== null ||
    plan.transport.mode !== "existing-api"
  ) {
    throw new Error("AC-GP01-07 binding not ready for ViewProjectContext");
  }
  return plan;
}
