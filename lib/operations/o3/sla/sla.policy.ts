/**
 * Operations O3 — SLA policy
 */

import {
  SLA_TARGETS,
  TICKET_PRIORITIES,
} from "../ticket/ticket.constants";
import type {
  RegisterSlaPolicyInput,
  SlaPolicy,
  SlaPriority,
  SlaTarget,
} from "./sla.types";

const policies = new Map<string, SlaPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: SlaPolicy): SlaPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerSlaPolicy(
  input: RegisterSlaPolicyInput,
): SlaPolicy {
  const name = input.name.trim();
  if (!name) throw new Error("sla.name is required");
  if (!(SLA_TARGETS as readonly string[]).includes(input.target)) {
    throw new Error(`invalid sla target: ${input.target}`);
  }
  if (!(TICKET_PRIORITIES as readonly string[]).includes(input.priority)) {
    throw new Error(`invalid sla priority: ${input.priority}`);
  }
  if (
    !Number.isFinite(input.thresholdMinutes) ||
    input.thresholdMinutes <= 0
  ) {
    throw new Error("sla.thresholdMinutes must be a positive number");
  }

  const id = input.id?.trim() || createId("o3sla");
  if (policies.has(id)) {
    throw new Error(`sla policy already exists: ${id}`);
  }

  const thresholdMinutes = Math.round(input.thresholdMinutes);
  const policy: SlaPolicy = {
    id,
    name,
    target: input.target,
    priority: input.priority,
    thresholdMinutes,
    detail: `target=${input.target} priority=${input.priority} threshold=${thresholdMinutes}m`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getSlaPolicy(id: string): SlaPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listSlaPolicies(filter?: {
  target?: SlaTarget;
  priority?: SlaPriority;
}): SlaPolicy[] {
  let result = [...policies.values()];
  if (filter?.target) {
    result = result.filter((p) => p.target === filter.target);
  }
  if (filter?.priority) {
    result = result.filter((p) => p.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearSlaPolicies(): void {
  policies.clear();
}
