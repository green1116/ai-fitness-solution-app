/**
 * WP-74 — Workspace Filter Engine
 * Deterministic read-only filters over Workspace / Workspace View.
 */
import { getWorkspace, type Workspace } from "./workspace";
import {
  buildWorkspaceView,
  getWorkspaceView,
  type WorkspaceView,
} from "./workspace-view";

export const FEAT_75_ID = "FEAT-75" as const;
export const WORKSPACE_FILTER_ENGINE_CAPABILITY =
  "WorkspaceFilterEngine" as const;

export const WORKSPACE_FILTER_KEYS = [
  "all",
  "active",
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
] as const;

export type WorkspaceFilterKey = (typeof WORKSPACE_FILTER_KEYS)[number];

/** Named filter slices projected from Workspace View (no new ranking). */
export type WorkspaceFilter = Readonly<{
  all: WorkspaceView;
  active: Readonly<{
    pending: WorkspaceView["pending"];
    running: WorkspaceView["running"];
  }>;
  important: WorkspaceView["important"];
  pending: WorkspaceView["pending"];
  running: WorkspaceView["running"];
  completed: WorkspaceView["completed"];
  attention: WorkspaceView["attention"];
  recommendations: WorkspaceView["recommendations"];
  insights: WorkspaceView["insights"];
  tasks: WorkspaceView["tasks"];
  plans: WorkspaceView["plans"];
  reports: WorkspaceView["reports"];
  metrics: WorkspaceView["metrics"];
}>;

export type BuildWorkspaceFilterInput = Readonly<{
  workspace?: Workspace;
  view?: WorkspaceView;
}>;

let cachedFilter: WorkspaceFilter | null = null;

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

function cloneView(view: WorkspaceView): WorkspaceView {
  return {
    summary: view.summary,
    today: [...view.today],
    important: view.important.map((i) => ({ ...i })),
    pending: view.pending.map((i) => ({ ...i })),
    running: view.running.map((i) => ({ ...i })),
    completed: view.completed.map((i) => ({ ...i })),
    attention: view.attention.map((i) => ({ ...i })),
    recommendations: view.recommendations.map((i) => ({ ...i })),
    insights: view.insights.map((i) => ({ ...i })),
    tasks: view.tasks.map((i) => ({ ...i })),
    plans: view.plans.map((i) => ({ ...i })),
    reports: view.reports.map((i) => ({ ...i })),
    metrics: view.metrics ? { ...view.metrics } : null,
  };
}

function cloneFilter(row: WorkspaceFilter): WorkspaceFilter {
  return {
    all: cloneView(row.all),
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

function resolveView(input: BuildWorkspaceFilterInput): WorkspaceView {
  try {
    if (input.view) {
      return cloneView(input.view);
    }
    if (input.workspace) {
      return buildWorkspaceView({ workspace: input.workspace });
    }
    // Reuse Workspace + Workspace View surfaces.
    void getWorkspace();
    return getWorkspaceView();
  } catch {
    return emptyView();
  }
}

/**
 * Build read-only filter slices from Workspace View.
 * active = pending + running (existing workspace slices only).
 */
export function buildWorkspaceFilter(
  input: BuildWorkspaceFilterInput = {},
): WorkspaceFilter {
  const view = resolveView(input);
  const pending = view.pending.map((i) => ({ ...i }));
  const running = view.running.map((i) => ({ ...i }));

  const filter: WorkspaceFilter = {
    all: cloneView(view),
    active: { pending, running },
    important: view.important.map((i) => ({ ...i })),
    pending: view.pending.map((i) => ({ ...i })),
    running: view.running.map((i) => ({ ...i })),
    completed: view.completed.map((i) => ({ ...i })),
    attention: view.attention.map((i) => ({ ...i })),
    recommendations: view.recommendations.map((i) => ({ ...i })),
    insights: view.insights.map((i) => ({ ...i })),
    tasks: view.tasks.map((i) => ({ ...i })),
    plans: view.plans.map((i) => ({ ...i })),
    reports: view.reports.map((i) => ({ ...i })),
    metrics: view.metrics ? { ...view.metrics } : null,
  };

  cachedFilter = cloneFilter(filter);
  return cloneFilter(filter);
}

/**
 * Get the last built workspace filter, or build if none cached.
 */
export function getWorkspaceFilter(): WorkspaceFilter {
  if (!cachedFilter) {
    return buildWorkspaceFilter();
  }
  return cloneFilter(cachedFilter);
}

/** Test helper — clears cached workspace filter. */
export function clearWorkspaceFilter(): void {
  cachedFilter = null;
}
