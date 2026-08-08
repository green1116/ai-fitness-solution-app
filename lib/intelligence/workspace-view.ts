/**
 * WP-73 — Workspace View Engine
 * Read-only view layer over Workspace (workspace.ts only).
 */
import {
  getWorkspace,
  type Workspace,
} from "./workspace";

export const FEAT_74_ID = "FEAT-74" as const;
export const WORKSPACE_VIEW_ENGINE_CAPABILITY = "WorkspaceViewEngine" as const;

/** Presentation projection of Workspace — same view keys, read-only. */
export type WorkspaceView = Readonly<{
  summary: Workspace["summary"];
  today: Workspace["today"];
  important: Workspace["important"];
  pending: Workspace["pending"];
  running: Workspace["running"];
  completed: Workspace["completed"];
  attention: Workspace["attention"];
  recommendations: Workspace["recommendations"];
  insights: Workspace["insights"];
  tasks: Workspace["tasks"];
  plans: Workspace["plans"];
  reports: Workspace["reports"];
  metrics: Workspace["metrics"];
}>;

export type BuildWorkspaceViewInput = Readonly<{
  workspace?: Workspace;
}>;

let cachedView: WorkspaceView | null = null;

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

function projectView(workspace: Workspace): WorkspaceView {
  return {
    summary: workspace.summary,
    today: [...workspace.today],
    important: workspace.important.map((i) => ({ ...i })),
    pending: workspace.pending.map((i) => ({ ...i })),
    running: workspace.running.map((i) => ({ ...i })),
    completed: workspace.completed.map((i) => ({ ...i })),
    attention: workspace.attention.map((i) => ({ ...i })),
    recommendations: workspace.recommendations.map((i) => ({ ...i })),
    insights: workspace.insights.map((i) => ({ ...i })),
    tasks: workspace.tasks.map((i) => ({ ...i })),
    plans: workspace.plans.map((i) => ({ ...i })),
    reports: workspace.reports.map((i) => ({ ...i })),
    metrics: workspace.metrics ? { ...workspace.metrics } : null,
  };
}

function cloneView(row: WorkspaceView): WorkspaceView {
  return projectView(row as Workspace);
}

function safeWorkspace(input: BuildWorkspaceViewInput): Workspace | null {
  try {
    if (input.workspace) {
      return input.workspace;
    }
    return getWorkspace();
  } catch {
    return null;
  }
}

/**
 * Build a read-only WorkspaceView by projecting Workspace fields.
 * No filtering/ranking — preserves Workspace order as-is.
 */
export function buildWorkspaceView(
  input: BuildWorkspaceViewInput = {},
): WorkspaceView {
  const workspace = safeWorkspace(input);
  const view = workspace ? projectView(workspace) : emptyView();
  cachedView = cloneView(view);
  return cloneView(view);
}

/**
 * Get the last built workspace view, or build if none cached.
 */
export function getWorkspaceView(): WorkspaceView {
  if (!cachedView) {
    return buildWorkspaceView();
  }
  return cloneView(cachedView);
}

/** Test helper — clears cached workspace view. */
export function clearWorkspaceView(): void {
  cachedView = null;
}
