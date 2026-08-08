/**
 * WP-76 — Workspace Panel Engine
 * Deterministic read-only UI panels from Workspace layers.
 */
import { getWorkspace, type Workspace } from "./workspace";
import {
  getWorkspaceView,
  type WorkspaceView,
} from "./workspace-view";
import {
  getWorkspaceFilter,
  type WorkspaceFilter,
} from "./workspace-filter";
import {
  buildWorkspaceRouter,
  getWorkspaceRouter,
  type WorkspaceRouter,
} from "./workspace-router";

export const FEAT_77_ID = "FEAT-77" as const;
export const WORKSPACE_PANEL_ENGINE_CAPABILITY =
  "WorkspacePanelEngine" as const;

export const WORKSPACE_PANEL_KEYS = [
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

export type WorkspacePanelKey = (typeof WORKSPACE_PANEL_KEYS)[number];

export type WorkspacePanelFrame<
  K extends WorkspacePanelKey,
  T,
> = Readonly<{
  id: string;
  key: K;
  position: number;
  payload: T;
}>;

/** Named UI panels projected from Workspace Router (no new ranking). */
export type WorkspacePanel = Readonly<{
  summary: WorkspacePanelFrame<"summary", WorkspaceRouter["summary"]>;
  today: WorkspacePanelFrame<"today", WorkspaceRouter["today"]>;
  important: WorkspacePanelFrame<"important", WorkspaceRouter["important"]>;
  pending: WorkspacePanelFrame<"pending", WorkspaceRouter["pending"]>;
  running: WorkspacePanelFrame<"running", WorkspaceRouter["running"]>;
  completed: WorkspacePanelFrame<"completed", WorkspaceRouter["completed"]>;
  attention: WorkspacePanelFrame<"attention", WorkspaceRouter["attention"]>;
  recommendations: WorkspacePanelFrame<
    "recommendations",
    WorkspaceRouter["recommendations"]
  >;
  insights: WorkspacePanelFrame<"insights", WorkspaceRouter["insights"]>;
  tasks: WorkspacePanelFrame<"tasks", WorkspaceRouter["tasks"]>;
  plans: WorkspacePanelFrame<"plans", WorkspaceRouter["plans"]>;
  reports: WorkspacePanelFrame<"reports", WorkspaceRouter["reports"]>;
  metrics: WorkspacePanelFrame<"metrics", WorkspaceRouter["metrics"]>;
  active: WorkspacePanelFrame<"active", WorkspaceRouter["active"]>;
}>;

export type BuildWorkspacePanelInput = Readonly<{
  workspace?: Workspace;
  view?: WorkspaceView;
  filter?: WorkspaceFilter;
  router?: WorkspaceRouter;
}>;

let cachedPanel: WorkspacePanel | null = null;

function frame<K extends WorkspacePanelKey, T>(
  key: K,
  position: number,
  payload: T,
): WorkspacePanelFrame<K, T> {
  return {
    id: `panel-${key}`,
    key,
    position,
    payload,
  };
}

function cloneActive(active: WorkspaceRouter["active"]): WorkspaceRouter["active"] {
  return {
    pending: active.pending.map((i) => ({ ...i })),
    running: active.running.map((i) => ({ ...i })),
  };
}

function cloneRouterPayload(router: WorkspaceRouter): WorkspaceRouter {
  return {
    summary: router.summary,
    today: [...router.today],
    important: router.important.map((i) => ({ ...i })),
    pending: router.pending.map((i) => ({ ...i })),
    running: router.running.map((i) => ({ ...i })),
    completed: router.completed.map((i) => ({ ...i })),
    attention: router.attention.map((i) => ({ ...i })),
    recommendations: router.recommendations.map((i) => ({ ...i })),
    insights: router.insights.map((i) => ({ ...i })),
    tasks: router.tasks.map((i) => ({ ...i })),
    plans: router.plans.map((i) => ({ ...i })),
    reports: router.reports.map((i) => ({ ...i })),
    metrics: router.metrics ? { ...router.metrics } : null,
    active: cloneActive(router.active),
  };
}

function clonePanel(row: WorkspacePanel): WorkspacePanel {
  return {
    summary: frame("summary", row.summary.position, row.summary.payload),
    today: frame("today", row.today.position, [...row.today.payload]),
    important: frame(
      "important",
      row.important.position,
      row.important.payload.map((i) => ({ ...i })),
    ),
    pending: frame(
      "pending",
      row.pending.position,
      row.pending.payload.map((i) => ({ ...i })),
    ),
    running: frame(
      "running",
      row.running.position,
      row.running.payload.map((i) => ({ ...i })),
    ),
    completed: frame(
      "completed",
      row.completed.position,
      row.completed.payload.map((i) => ({ ...i })),
    ),
    attention: frame(
      "attention",
      row.attention.position,
      row.attention.payload.map((i) => ({ ...i })),
    ),
    recommendations: frame(
      "recommendations",
      row.recommendations.position,
      row.recommendations.payload.map((i) => ({ ...i })),
    ),
    insights: frame(
      "insights",
      row.insights.position,
      row.insights.payload.map((i) => ({ ...i })),
    ),
    tasks: frame(
      "tasks",
      row.tasks.position,
      row.tasks.payload.map((i) => ({ ...i })),
    ),
    plans: frame(
      "plans",
      row.plans.position,
      row.plans.payload.map((i) => ({ ...i })),
    ),
    reports: frame(
      "reports",
      row.reports.position,
      row.reports.payload.map((i) => ({ ...i })),
    ),
    metrics: frame(
      "metrics",
      row.metrics.position,
      row.metrics.payload ? { ...row.metrics.payload } : null,
    ),
    active: frame("active", row.active.position, cloneActive(row.active.payload)),
  };
}

function emptyRouter(): WorkspaceRouter {
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
    active: { pending: [], running: [] },
  };
}

function resolveRouter(input: BuildWorkspacePanelInput): WorkspaceRouter {
  try {
    if (input.router) {
      return cloneRouterPayload(input.router);
    }
    if (input.workspace || input.view || input.filter) {
      return buildWorkspaceRouter({
        workspace: input.workspace,
        view: input.view,
        filter: input.filter,
      });
    }
    // Reuse all Workspace layer surfaces.
    void getWorkspace();
    void getWorkspaceView();
    void getWorkspaceFilter();
    return getWorkspaceRouter();
  } catch {
    return emptyRouter();
  }
}

/**
 * Build read-only UI panels from Workspace Router slices.
 * Panel order follows WORKSPACE_PANEL_KEYS; payloads preserve source order.
 */
export function buildWorkspacePanel(
  input: BuildWorkspacePanelInput = {},
): WorkspacePanel {
  const router = resolveRouter(input);

  const panel: WorkspacePanel = {
    summary: frame("summary", 1, router.summary),
    today: frame("today", 2, [...router.today]),
    important: frame(
      "important",
      3,
      router.important.map((i) => ({ ...i })),
    ),
    pending: frame(
      "pending",
      4,
      router.pending.map((i) => ({ ...i })),
    ),
    running: frame(
      "running",
      5,
      router.running.map((i) => ({ ...i })),
    ),
    completed: frame(
      "completed",
      6,
      router.completed.map((i) => ({ ...i })),
    ),
    attention: frame(
      "attention",
      7,
      router.attention.map((i) => ({ ...i })),
    ),
    recommendations: frame(
      "recommendations",
      8,
      router.recommendations.map((i) => ({ ...i })),
    ),
    insights: frame(
      "insights",
      9,
      router.insights.map((i) => ({ ...i })),
    ),
    tasks: frame(
      "tasks",
      10,
      router.tasks.map((i) => ({ ...i })),
    ),
    plans: frame(
      "plans",
      11,
      router.plans.map((i) => ({ ...i })),
    ),
    reports: frame(
      "reports",
      12,
      router.reports.map((i) => ({ ...i })),
    ),
    metrics: frame(
      "metrics",
      13,
      router.metrics ? { ...router.metrics } : null,
    ),
    active: frame("active", 14, cloneActive(router.active)),
  };

  cachedPanel = clonePanel(panel);
  return clonePanel(panel);
}

/**
 * Get the last built workspace panel, or build if none cached.
 */
export function getWorkspacePanel(): WorkspacePanel {
  if (!cachedPanel) {
    return buildWorkspacePanel();
  }
  return clonePanel(cachedPanel);
}

/** Test helper — clears cached workspace panel. */
export function clearWorkspacePanel(): void {
  cachedPanel = null;
}
