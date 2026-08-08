/**
 * WP-77 — Workspace Card Engine
 * Deterministic read-only cards from Workspace panels.
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
  getWorkspaceRouter,
  type WorkspaceRouter,
} from "./workspace-router";
import {
  buildWorkspacePanel,
  getWorkspacePanel,
  type WorkspacePanel,
  type WorkspacePanelFrame,
  type WorkspacePanelKey,
} from "./workspace-panel";

export const FEAT_78_ID = "FEAT-78" as const;
export const WORKSPACE_CARD_ENGINE_CAPABILITY = "WorkspaceCardEngine" as const;

export const WORKSPACE_CARD_KEYS = [
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

export type WorkspaceCardKey = (typeof WORKSPACE_CARD_KEYS)[number];

export type WorkspaceCardFrame<
  K extends WorkspaceCardKey,
  T,
> = Readonly<{
  id: string;
  key: K;
  position: number;
  panelId: string;
  payload: T;
}>;

/** Named cards projected from Workspace Panels (no new ranking). */
export type WorkspaceCard = Readonly<{
  summary: WorkspaceCardFrame<"summary", WorkspacePanel["summary"]["payload"]>;
  today: WorkspaceCardFrame<"today", WorkspacePanel["today"]["payload"]>;
  important: WorkspaceCardFrame<
    "important",
    WorkspacePanel["important"]["payload"]
  >;
  pending: WorkspaceCardFrame<"pending", WorkspacePanel["pending"]["payload"]>;
  running: WorkspaceCardFrame<"running", WorkspacePanel["running"]["payload"]>;
  completed: WorkspaceCardFrame<
    "completed",
    WorkspacePanel["completed"]["payload"]
  >;
  attention: WorkspaceCardFrame<
    "attention",
    WorkspacePanel["attention"]["payload"]
  >;
  recommendations: WorkspaceCardFrame<
    "recommendations",
    WorkspacePanel["recommendations"]["payload"]
  >;
  insights: WorkspaceCardFrame<
    "insights",
    WorkspacePanel["insights"]["payload"]
  >;
  tasks: WorkspaceCardFrame<"tasks", WorkspacePanel["tasks"]["payload"]>;
  plans: WorkspaceCardFrame<"plans", WorkspacePanel["plans"]["payload"]>;
  reports: WorkspaceCardFrame<"reports", WorkspacePanel["reports"]["payload"]>;
  metrics: WorkspaceCardFrame<"metrics", WorkspacePanel["metrics"]["payload"]>;
  active: WorkspaceCardFrame<"active", WorkspacePanel["active"]["payload"]>;
}>;

export type BuildWorkspaceCardInput = Readonly<{
  workspace?: Workspace;
  view?: WorkspaceView;
  filter?: WorkspaceFilter;
  router?: WorkspaceRouter;
  panel?: WorkspacePanel;
}>;

let cachedCard: WorkspaceCard | null = null;

function cardFromPanel<K extends WorkspacePanelKey, T>(
  panel: WorkspacePanelFrame<K, T>,
): WorkspaceCardFrame<K, T> {
  return {
    id: `card-${panel.key}`,
    key: panel.key,
    position: panel.position,
    panelId: panel.id,
    payload: panel.payload,
  };
}

function cloneActive(
  active: WorkspacePanel["active"]["payload"],
): WorkspacePanel["active"]["payload"] {
  return {
    pending: active.pending.map((i) => ({ ...i })),
    running: active.running.map((i) => ({ ...i })),
  };
}

function clonePanel(panel: WorkspacePanel): WorkspacePanel {
  return {
    summary: { ...panel.summary, payload: panel.summary.payload },
    today: { ...panel.today, payload: [...panel.today.payload] },
    important: {
      ...panel.important,
      payload: panel.important.payload.map((i) => ({ ...i })),
    },
    pending: {
      ...panel.pending,
      payload: panel.pending.payload.map((i) => ({ ...i })),
    },
    running: {
      ...panel.running,
      payload: panel.running.payload.map((i) => ({ ...i })),
    },
    completed: {
      ...panel.completed,
      payload: panel.completed.payload.map((i) => ({ ...i })),
    },
    attention: {
      ...panel.attention,
      payload: panel.attention.payload.map((i) => ({ ...i })),
    },
    recommendations: {
      ...panel.recommendations,
      payload: panel.recommendations.payload.map((i) => ({ ...i })),
    },
    insights: {
      ...panel.insights,
      payload: panel.insights.payload.map((i) => ({ ...i })),
    },
    tasks: {
      ...panel.tasks,
      payload: panel.tasks.payload.map((i) => ({ ...i })),
    },
    plans: {
      ...panel.plans,
      payload: panel.plans.payload.map((i) => ({ ...i })),
    },
    reports: {
      ...panel.reports,
      payload: panel.reports.payload.map((i) => ({ ...i })),
    },
    metrics: {
      ...panel.metrics,
      payload: panel.metrics.payload ? { ...panel.metrics.payload } : null,
    },
    active: {
      ...panel.active,
      payload: cloneActive(panel.active.payload),
    },
  };
}

function cloneCard(row: WorkspaceCard): WorkspaceCard {
  return {
    summary: {
      ...row.summary,
      payload: row.summary.payload,
    },
    today: {
      ...row.today,
      payload: [...row.today.payload],
    },
    important: {
      ...row.important,
      payload: row.important.payload.map((i) => ({ ...i })),
    },
    pending: {
      ...row.pending,
      payload: row.pending.payload.map((i) => ({ ...i })),
    },
    running: {
      ...row.running,
      payload: row.running.payload.map((i) => ({ ...i })),
    },
    completed: {
      ...row.completed,
      payload: row.completed.payload.map((i) => ({ ...i })),
    },
    attention: {
      ...row.attention,
      payload: row.attention.payload.map((i) => ({ ...i })),
    },
    recommendations: {
      ...row.recommendations,
      payload: row.recommendations.payload.map((i) => ({ ...i })),
    },
    insights: {
      ...row.insights,
      payload: row.insights.payload.map((i) => ({ ...i })),
    },
    tasks: {
      ...row.tasks,
      payload: row.tasks.payload.map((i) => ({ ...i })),
    },
    plans: {
      ...row.plans,
      payload: row.plans.payload.map((i) => ({ ...i })),
    },
    reports: {
      ...row.reports,
      payload: row.reports.payload.map((i) => ({ ...i })),
    },
    metrics: {
      ...row.metrics,
      payload: row.metrics.payload ? { ...row.metrics.payload } : null,
    },
    active: {
      ...row.active,
      payload: cloneActive(row.active.payload),
    },
  };
}

function emptyPanel(): WorkspacePanel {
  return buildWorkspacePanel({
    router: {
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
    },
  });
}

function resolvePanel(input: BuildWorkspaceCardInput): WorkspacePanel {
  try {
    if (input.panel) {
      return clonePanel(input.panel);
    }
    if (input.workspace || input.view || input.filter || input.router) {
      return buildWorkspacePanel({
        workspace: input.workspace,
        view: input.view,
        filter: input.filter,
        router: input.router,
      });
    }
    // Reuse all Workspace layer surfaces.
    void getWorkspace();
    void getWorkspaceView();
    void getWorkspaceFilter();
    void getWorkspaceRouter();
    return getWorkspacePanel();
  } catch {
    return emptyPanel();
  }
}

/**
 * Build read-only cards from Workspace Panel frames.
 * Card order and payloads mirror panels; no new ranking.
 */
export function buildWorkspaceCard(
  input: BuildWorkspaceCardInput = {},
): WorkspaceCard {
  const panel = resolvePanel(input);

  const card: WorkspaceCard = {
    summary: cardFromPanel(panel.summary),
    today: cardFromPanel({
      ...panel.today,
      payload: [...panel.today.payload],
    }),
    important: cardFromPanel({
      ...panel.important,
      payload: panel.important.payload.map((i) => ({ ...i })),
    }),
    pending: cardFromPanel({
      ...panel.pending,
      payload: panel.pending.payload.map((i) => ({ ...i })),
    }),
    running: cardFromPanel({
      ...panel.running,
      payload: panel.running.payload.map((i) => ({ ...i })),
    }),
    completed: cardFromPanel({
      ...panel.completed,
      payload: panel.completed.payload.map((i) => ({ ...i })),
    }),
    attention: cardFromPanel({
      ...panel.attention,
      payload: panel.attention.payload.map((i) => ({ ...i })),
    }),
    recommendations: cardFromPanel({
      ...panel.recommendations,
      payload: panel.recommendations.payload.map((i) => ({ ...i })),
    }),
    insights: cardFromPanel({
      ...panel.insights,
      payload: panel.insights.payload.map((i) => ({ ...i })),
    }),
    tasks: cardFromPanel({
      ...panel.tasks,
      payload: panel.tasks.payload.map((i) => ({ ...i })),
    }),
    plans: cardFromPanel({
      ...panel.plans,
      payload: panel.plans.payload.map((i) => ({ ...i })),
    }),
    reports: cardFromPanel({
      ...panel.reports,
      payload: panel.reports.payload.map((i) => ({ ...i })),
    }),
    metrics: cardFromPanel({
      ...panel.metrics,
      payload: panel.metrics.payload ? { ...panel.metrics.payload } : null,
    }),
    active: cardFromPanel({
      ...panel.active,
      payload: cloneActive(panel.active.payload),
    }),
  };

  cachedCard = cloneCard(card);
  return cloneCard(card);
}

/**
 * Get the last built workspace card, or build if none cached.
 */
export function getWorkspaceCard(): WorkspaceCard {
  if (!cachedCard) {
    return buildWorkspaceCard();
  }
  return cloneCard(cachedCard);
}

/** Test helper — clears cached workspace card. */
export function clearWorkspaceCard(): void {
  cachedCard = null;
}
