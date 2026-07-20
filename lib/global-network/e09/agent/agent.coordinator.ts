/**
 * E09-P6 — Agent Coordinator
 * Coordinate agents, dispatch and execute tasks
 */

import {
  AGENT_TASK_KINDS,
  AGENT_TASK_STATUSES,
} from "./agent.constants";
import {
  getAgent,
  listAgents,
  setAgentStatus,
} from "./agent.registry";
import type {
  AgentTask,
  AgentTaskKind,
  AgentTaskStatus,
  CoordinationPlan,
  DispatchTaskInput,
  GlobalAgent,
} from "./agent.types";

const tasks = new Map<string, AgentTask>();
const plans = new Map<string, CoordinationPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTask(task: AgentTask): AgentTask {
  return {
    ...task,
    agentIds: [...task.agentIds],
    payload: { ...task.payload },
    result: task.result ? { ...task.result } : undefined,
  };
}

function clonePlan(plan: CoordinationPlan): CoordinationPlan {
  return {
    ...plan,
    agentIds: [...plan.agentIds],
    roles: { ...plan.roles },
  };
}

function assertTaskKind(kind: string): asserts kind is AgentTaskKind {
  if (!(AGENT_TASK_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid agent task kind: ${kind}`);
  }
}

function assertTaskStatus(
  status: string,
): asserts status is AgentTaskStatus {
  if (!(AGENT_TASK_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid agent task status: ${status}`);
  }
}

function resolveAgents(agentIds: string[]): GlobalAgent[] {
  if (!Array.isArray(agentIds) || agentIds.length === 0) {
    throw new Error("agentIds must be a non-empty array");
  }
  const resolved: GlobalAgent[] = [];
  for (const raw of agentIds) {
    const id = raw.trim();
    const agent = getAgent(id);
    if (!agent) throw new Error(`agent not found: ${id}`);
    if (agent.status === "SUSPENDED") {
      throw new Error(`agent is SUSPENDED: ${id}`);
    }
    resolved.push(agent);
  }
  return resolved;
}

/**
 * Build a coordination plan across agents.
 * Prefers COORDINATOR role as lead; otherwise highest trustLevel.
 */
export function coordinateAgents(
  agentIds: string[],
  options?: { strategy?: CoordinationPlan["strategy"] },
): CoordinationPlan {
  const agents = resolveAgents(agentIds);
  const uniqueIds = [...new Set(agents.map((a) => a.id))];
  if (uniqueIds.length !== agents.length) {
    throw new Error("coordinateAgents refuses duplicate agent ids");
  }

  const coordinator = agents.find((a) => a.role === "COORDINATOR");
  const lead =
    coordinator ??
    [...agents].sort(
      (a, b) => b.trustLevel - a.trustLevel || a.id.localeCompare(b.id),
    )[0]!;

  const roles: Record<string, GlobalAgent["role"]> = {};
  for (const agent of agents) {
    roles[agent.id] = agent.role;
  }

  const strategy = options?.strategy ?? "LEAD_FOLLOW";
  const plan: CoordinationPlan = {
    id: createId("coord-plan"),
    agentIds: uniqueIds,
    leadAgentId: lead.id,
    roles,
    strategy,
    createdAt: nowIso(),
  };

  plans.set(plan.id, plan);
  return clonePlan(plan);
}

/** Dispatch a task to one or more registered agents. */
export function dispatchTask(input: DispatchTaskInput): AgentTask {
  const title = input.title.trim();
  if (!title) throw new Error("task.title is required");
  assertTaskKind(input.kind);

  const agents = resolveAgents(input.agentIds);
  for (const agent of agents) {
    if (agent.status === "BUSY") {
      throw new Error(`agent is BUSY: ${agent.id}`);
    }
  }

  const id = input.id?.trim() || createId("agent-task");
  if (tasks.has(id)) {
    throw new Error(`task already exists: ${id}`);
  }

  const task: AgentTask = {
    id,
    kind: input.kind,
    title,
    status: "DISPATCHED",
    agentIds: agents.map((a) => a.id),
    payload: { ...(input.payload ?? {}) },
    createdAt: nowIso(),
  };
  assertTaskStatus(task.status);

  for (const agent of agents) {
    setAgentStatus(agent.id, "BUSY");
  }

  tasks.set(id, task);
  return cloneTask(task);
}

/** Execute a dispatched task and mark agents IDLE/ACTIVE on completion. */
export function executeTask(taskId: string): AgentTask {
  const id = taskId.trim();
  const task = tasks.get(id);
  if (!task) throw new Error(`task not found: ${id}`);
  if (task.status === "COMPLETED") {
    throw new Error(`task already completed: ${id}`);
  }
  if (task.status === "FAILED") {
    throw new Error(`cannot execute failed task: ${id}`);
  }
  if (task.status !== "DISPATCHED" && task.status !== "RUNNING") {
    throw new Error(
      `execute requires DISPATCHED or RUNNING (current=${task.status})`,
    );
  }

  task.status = "RUNNING";
  tasks.set(task.id, task);

  try {
    const agents = task.agentIds.map((agentId) => {
      const agent = getAgent(agentId);
      if (!agent) throw new Error(`agent not found: ${agentId}`);
      return agent;
    });

    const avgTrust =
      agents.reduce((sum, a) => sum + a.trustLevel, 0) / agents.length;

    task.result = {
      kind: task.kind,
      title: task.title,
      agentCount: agents.length,
      agentIds: agents.map((a) => a.id),
      avgTrust: Math.round(avgTrust * 10) / 10,
      capabilities: [
        ...new Set(agents.flatMap((a) => a.capabilities)),
      ],
      summary: `executed ${task.kind} with ${agents.length} agent(s)`,
    };
    task.status = "COMPLETED";
    task.completedAt = nowIso();
    tasks.set(task.id, task);

    for (const agent of agents) {
      // Restore to ACTIVE if previously registered ACTIVE-capable; else IDLE
      const next = agent.role === "COORDINATOR" ? "ACTIVE" : "IDLE";
      setAgentStatus(agent.id, next);
    }

    return cloneTask(task);
  } catch (error) {
    task.status = "FAILED";
    task.result = {
      error: error instanceof Error ? error.message : "execute failed",
    };
    task.completedAt = nowIso();
    tasks.set(task.id, task);

    for (const agentId of task.agentIds) {
      if (getAgent(agentId)) setAgentStatus(agentId, "IDLE");
    }

    throw error instanceof Error
      ? error
      : new Error("executeTask failed");
  }
}

export function getTask(id: string): AgentTask | undefined {
  const task = tasks.get(id.trim());
  return task ? cloneTask(task) : undefined;
}

export function listTasks(filter?: {
  status?: AgentTaskStatus;
  kind?: AgentTaskKind;
  agentId?: string;
}): AgentTask[] {
  let result = [...tasks.values()];
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  if (filter?.kind) {
    result = result.filter((t) => t.kind === filter.kind);
  }
  if (filter?.agentId) {
    const agentId = filter.agentId.trim();
    result = result.filter((t) => t.agentIds.includes(agentId));
  }
  return result
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    .map(cloneTask);
}

export function getCoordinationPlan(
  id: string,
): CoordinationPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listCoordinationPlans(): CoordinationPlan[] {
  return [...plans.values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(clonePlan);
}

export function clearCoordinatorState(): void {
  tasks.clear();
  plans.clear();
}

export function availableAgents(): GlobalAgent[] {
  return listAgents().filter(
    (a) => a.status === "IDLE" || a.status === "ACTIVE",
  );
}
