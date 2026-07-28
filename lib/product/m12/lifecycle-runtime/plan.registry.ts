/**
 * Product M12 — Agent lifecycle plan registry (in-memory)
 */

import {
  AGENT_LIFECYCLE_PLAN_KINDS,
  AGENT_LIFECYCLE_PLAN_STATUSES,
} from "./lifecycle.constants";
import type {
  AgentLifecyclePlan,
  AgentLifecyclePlanKind,
  AgentLifecyclePlanStatus,
  RegisterAgentLifecyclePlanInput,
  UpdateAgentLifecyclePlanStatusInput,
} from "./lifecycle.types";

const plans = new Map<string, AgentLifecyclePlan>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: AgentLifecyclePlan): AgentLifecyclePlan {
  return { ...plan, metadata: { ...plan.metadata } };
}

export function registerAgentLifecyclePlan(
  input: RegisterAgentLifecyclePlanInput,
): AgentLifecyclePlan {
  const planKey = input.planKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!planKey) throw new Error("plan.planKey is required");
  if (!title) throw new Error("plan.title is required");
  if (!summary) throw new Error("plan.summary is required");
  if (!(AGENT_LIFECYCLE_PLAN_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid plan kind: ${input.kind}`);
  }
  if (keys.has(planKey)) {
    throw new Error(`planKey already exists: ${planKey}`);
  }

  const id = input.id?.trim() || createId("agtlcs");
  if (plans.has(id)) throw new Error(`plan already exists: ${id}`);

  const now = nowIso();
  const plan: AgentLifecyclePlan = {
    id,
    planKey,
    kind: input.kind,
    status: AGENT_LIFECYCLE_PLAN_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  keys.set(planKey, id);
  return clonePlan(plan);
}

export function updateAgentLifecyclePlanStatus(
  input: UpdateAgentLifecyclePlanStatusInput,
): AgentLifecyclePlan {
  const planId = input.planId.trim();
  if (!planId) throw new Error("plan.planId is required");
  if (
    !(AGENT_LIFECYCLE_PLAN_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid plan status: ${input.status}`);
  }

  const existing = plans.get(planId);
  if (!existing) throw new Error(`plan not found: ${planId}`);

  const updated: AgentLifecyclePlan = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  plans.set(planId, updated);
  return clonePlan(updated);
}

export function getAgentLifecyclePlan(
  id: string,
): AgentLifecyclePlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listAgentLifecyclePlans(filter?: {
  kind?: AgentLifecyclePlanKind;
  status?: AgentLifecyclePlanStatus;
}): AgentLifecyclePlan[] {
  let result = [...plans.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.planKey.localeCompare(b.planKey))
    .map(clonePlan);
}

export function clearAgentLifecyclePlans(): void {
  plans.clear();
  keys.clear();
}
