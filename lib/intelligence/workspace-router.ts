/**
 * WP-75 — Workspace Router Engine
 * Deterministic read-only router over Workspace / View / Filter layers.
 */
import { getWorkspace, type Workspace } from "./workspace";
import {
  buildWorkspaceView,
  getWorkspaceView,
  type WorkspaceView,
} from "./workspace-view";
import {
  buildWorkspaceFilter,
  getWorkspaceFilter,
  type WorkspaceFilter,
} from "./workspace-filter";

export const FEAT_76_ID = "FEAT-76" as const;
export const WORKSPACE_ROUTER_ENGINE_CAPABILITY =
  "WorkspaceRouterEngine" as const;

export const WORKSPACE_ROUTE_KEYS = [
  "summary",
  "today",
  "important",
  "pending",
  "running",
  "completed",
  "attention",
  "recommendations",
  "insights",
  "tasks",
  "plans",
  "reports",
  "metrics",
  "active",
] as const;

export type WorkspaceRouteKey = (typeof WORKSPACE_ROUTE_KEYS)[number];

/** Named routes projected from existing Workspace layers (no new ranking). */
export type WorkspaceRouter = Readonly<{
  summary: WorkspaceView["summary"];
  today: WorkspaceView["today"];
  important: WorkspaceFilter["important"];
  pending: WorkspaceFilter["pending"];
  running: WorkspaceFilter["running"];
  completed: WorkspaceFilter["completed"];
  attention: WorkspaceFilter["attention"];
  recommendations: WorkspaceFilter["recommendations"];
  insights: WorkspaceFilter["insights"];
  tasks: WorkspaceFilter["tasks"];
  plans: WorkspaceFilter["plans"];
  reports: WorkspaceFilter["reports"];
  metrics: WorkspaceFilter["metrics"];
  active: WorkspaceFilter["active"];
}>;

export type BuildWorkspaceRouterInput = Readonly<{
  workspace?: Workspace;
  view?: WorkspaceView;
  filter?: WorkspaceFilter;
}>;

let cachedRouter: WorkspaceRouter | null = null;

function emptyView(): WorkspaceView {
  return {
    summary: "",
    today: [],
    important: [],
    pending: [],
    running: [],
    completed: [],
    attention: [],
    recommendations: [],
    insights: [],
    tasks: [],
    plans: [],
    reports: [],
    metrics: null,
  };
}

function emptyFilter(): WorkspaceFilter {
  const view = emptyView();
  return {
    all: view,
    active: { pending: [], running: [] },
    important: [],
    pending: [],
    running: [],
    completed: [],
    attention: [],
    recommendations: [],
    insights: [],
    tasks: [],
    plans: [],
    reports: [],
    metrics: null,
  };
}

function cloneFilter(row: WorkspaceFilter): WorkspaceFilter {
  return {
    all: {
      summary: row.all.summary,
      today: [...row.all.today],
      important: row.all.important.map((i) => ({ ...i })),
      pending: row.all.pending.map((i) => ({ ...i })),
      running: row.all.running.map((i) => ({ ...i })),
      completed: row.all.completed.map((i) => ({ ...i })),
      attention: row.all.attention.map((i) => ({ ...i })),
      recommendations: row.all.recommendations.map((i) => ({ ...i })),
      insights: row.all.insights.map((i) => ({ ...i })),
      tasks: row.all.tasks.map((i) => ({ ...i })),
      plans: row.all.plans.map((i) => ({ ...i })),
      reports: row.all.reports.map((i) => ({ ...i })),
      metrics: row.all.metrics ? { ...row.all.metrics } : null,
    },
    active: {
      pending: row.active.pending.map((i) => ({ ...i })),
      running: row.active.running.map((i) => ({ ...i })),
    },
    important: row.important.map((i) => ({ ...i })),
    pending: row.pending.map((i) => ({ ...i })),
    running: row.running.map((i) => ({ ...i })),
    completed: row.completed.map((i) => ({ ...i })),
    attention: row.attention.map((i) => ({ ...i })),
    recommendations: row.recommendations.map((i) => ({ ...i })),
    insights: row.insights.map((i) => ({ ...i })),
    tasks: row.tasks.map((i) => ({ ...i })),
    plans: row.plans.map((i) => ({ ...i })),
    reports: row.reports.map((i) => ({ ...i })),
    metrics: row.metrics ? { ...row.metrics } : null,
  };
}

function cloneRouter(row: WorkspaceRouter): WorkspaceRouter {
  return {
    summary: row.summary,
    today: [...row.today],
    important: row.important.map((i) => ({ ...i })),
    pending: row.pending.map((i) => ({ ...i })),
    running: row.running.map((i) => ({ ...i })),
    completed: row.completed.map((i) => ({ ...i })),
    attention: row.attention.map((i) => ({ ...i })),
    recommendations: row.recommendations.map((i) => ({ ...i })),
    insights: row.insights.map((i) => ({ ...i })),
    tasks: row.tasks.map((i) => ({ ...i })),
    plans: row.plans.map((i) => ({ ...i })),
    reports: row.reports.map((i) => ({ ...i })),
    metrics: row.metrics ? { ...row.metrics } : null,
    active: {
      pending: row.active.pending.map((i) => ({ ...i })),
      running: row.active.running.map((i) => ({ ...i })),
    },
  };
}

function resolveLayers(input: BuildWorkspaceRouterInput): {
  view: WorkspaceView;
  filter: WorkspaceFilter;
} {
  try {
    if (input.filter && input.view) {
      return { view: input.view, filter: cloneFilter(input.filter) };
    }
    if (input.filter) {
      return {
        view: input.view ?? input.filter.all,
        filter: cloneFilter(input.filter),
      };
    }
    if (input.view) {
      return {
        view: input.view,
        filter: buildWorkspaceFilter({
          workspace: input.workspace,
          view: input.view,
        }),
      };
    }
    if (input.workspace) {
      const view = buildWorkspaceView({ workspace: input.workspace });
      return {
        view,
        filter: buildWorkspaceFilter({ workspace: input.workspace, view }),
      };
    }
    // Reuse Workspace + View + Filter surfaces.
    void getWorkspace();
    const view = getWorkspaceView();
    const filter = getWorkspaceFilter();
    return { view, filter };
  } catch {
    return { view: emptyView(), filter: emptyFilter() };
  }
}

/**
 * Build read-only route map from existing Workspace layers.
 * No new ranking — routes select named slices only.
 */
export function buildWorkspaceRouter(
  input: BuildWorkspaceRouterInput = {},
): WorkspaceRouter {
  const { view, filter } = resolveLayers(input);

  const router: WorkspaceRouter = {
    summary: view.summary,
    today: [...view.today],
    important: filter.important.map((i) => ({ ...i })),
    pending: filter.pending.map((i) => ({ ...i })),
    running: filter.running.map((i) => ({ ...i })),
    completed: filter.completed.map((i) => ({ ...i })),
    attention: filter.attention.map((i) => ({ ...i })),
    recommendations: filter.recommendations.map((i) => ({ ...i })),
    insights: filter.insights.map((i) => ({ ...i })),
    tasks: filter.tasks.map((i) => ({ ...i })),
    plans: filter.plans.map((i) => ({ ...i })),
    reports: filter.reports.map((i) => ({ ...i })),
    metrics: filter.metrics ? { ...filter.metrics } : null,
    active: {
      pending: filter.active.pending.map((i) => ({ ...i })),
      running: filter.active.running.map((i) => ({ ...i })),
    },
  };

  cachedRouter = cloneRouter(router);
  return cloneRouter(router);
}

/**
 * Get the last built workspace router, or build if none cached.
 */
export function getWorkspaceRouter(): WorkspaceRouter {
  if (!cachedRouter) {
    return buildWorkspaceRouter();
  }
  return cloneRouter(cachedRouter);
}

/** Test helper — clears cached workspace router. */
export function clearWorkspaceRouter(): void {
  cachedRouter = null;
}
