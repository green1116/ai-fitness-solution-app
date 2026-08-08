/**
 * WP-72 — Workspace Engine
 * Read-only aggregate of existing Intelligence engine outputs.
 */
import {
  getRecommendations,
  type Recommendation,
} from "./recommendation";
import { getInsights, type Insight } from "./insight";
import { getPriorityItems, type PriorityItem } from "./priority";
import { getSignals } from "./signal";
import { getAttention, type AttentionItem } from "./attention";
import { getQueue } from "./queue";
import { getAssignment } from "./assignment";
import { getTask, type TaskItem } from "./task";
import { getPlan, type PlanItem } from "./plan";
import { getReview } from "./review";
import { getApproval } from "./approval";
import { getDecision } from "./decision";
import { getExecution, type ExecutionItem } from "./execution";
import { getReport, type ReportItem } from "./report";
import { getDashboard } from "./dashboard";
import {
  getIntelligenceMetrics,
  type IntelligenceMetrics,
} from "./metrics";

export const FEAT_73_ID = "FEAT-73" as const;
export const WORKSPACE_ENGINE_CAPABILITY = "WorkspaceEngine" as const;

export type Workspace = Readonly<{
  summary: string;
  today: readonly string[];
  important: readonly PriorityItem[];
  pending: readonly TaskItem[];
  running: readonly ExecutionItem[];
  completed: readonly TaskItem[];
  attention: readonly AttentionItem[];
  recommendations: readonly Recommendation[];
  insights: readonly Insight[];
  tasks: readonly TaskItem[];
  plans: readonly PlanItem[];
  reports: readonly ReportItem[];
  metrics: IntelligenceMetrics | null;
}>;

let cachedWorkspace: Workspace | null = null;

function safeList<T>(load: () => readonly T[]): T[] {
  try {
    return [...load()];
  } catch {
    return [];
  }
}

function safeMetrics(): IntelligenceMetrics | null {
  try {
    return { ...getIntelligenceMetrics() };
  } catch {
    return null;
  }
}

function cloneWorkspace(row: Workspace): Workspace {
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
  };
}

function formatSummary(input: {
  recommendations: number;
  insights: number;
  attention: number;
  tasks: number;
  plans: number;
  reports: number;
  important: number;
  pending: number;
  running: number;
  completed: number;
}): string {
  return [
    `recommendations=${input.recommendations}`,
    `insights=${input.insights}`,
    `attention=${input.attention}`,
    `tasks=${input.tasks}`,
    `plans=${input.plans}`,
    `reports=${input.reports}`,
    `important=${input.important}`,
    `pending=${input.pending}`,
    `running=${input.running}`,
    `completed=${input.completed}`,
  ].join(" ");
}

/**
 * Build a read-only workspace by aggregating existing Intelligence outputs.
 * No new ranking algorithms — filters reuse engine status fields only.
 */
export function buildWorkspace(): Workspace {
  const recommendations = safeList(getRecommendations);
  const insights = safeList(getInsights);
  const priorityItems = safeList(getPriorityItems);
  const signals = safeList(getSignals);
  const attention = safeList(getAttention);
  const queue = safeList(getQueue);
  const assignments = safeList(getAssignment);
  const tasks = safeList(getTask);
  const plans = safeList(getPlan);
  const reviews = safeList(getReview);
  const approvals = safeList(getApproval);
  const decisions = safeList(getDecision);
  const executions = safeList(getExecution);
  const reports = safeList(getReport);
  const dashboards = safeList(getDashboard);
  const metrics = safeMetrics();

  // Touch reused surfaces (stable, no new logic).
  void signals.length;
  void assignments.length;
  void reviews.length;
  void approvals.length;
  void decisions.length;
  void dashboards.length;

  const important = priorityItems.filter((p) => p.priority === "HIGH");
  const pending = tasks.filter((t) => t.status === "WAITING");
  const running = executions.filter((e) => e.action === "RUN");
  const completed = tasks.filter((t) => t.status === "DONE");

  // today: queue order already stable by position
  const today = queue
    .slice()
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
    .map((q) => q.id);

  const workspace: Workspace = {
    summary: formatSummary({
      recommendations: recommendations.length,
      insights: insights.length,
      attention: attention.length,
      tasks: tasks.length,
      plans: plans.length,
      reports: reports.length,
      important: important.length,
      pending: pending.length,
      running: running.length,
      completed: completed.length,
    }),
    today,
    important,
    pending,
    running,
    completed,
    attention,
    recommendations,
    insights,
    tasks,
    plans,
    reports,
    metrics,
  };

  cachedWorkspace = cloneWorkspace(workspace);
  return cloneWorkspace(workspace);
}

/**
 * Get the last built workspace, or build if none cached.
 */
export function getWorkspace(): Workspace {
  if (!cachedWorkspace) {
    return buildWorkspace();
  }
  return cloneWorkspace(cachedWorkspace);
}

/** Test helper — clears cached workspace. */
export function clearWorkspace(): void {
  cachedWorkspace = null;
}
