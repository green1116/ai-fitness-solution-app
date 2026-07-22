/**
 * Commercialization P4 — Customer requirements
 */

import { REQUIREMENT_PRIORITIES } from "../onboarding/onboarding.constants";
import { getCustomerAccount } from "../account/account.registry";
import type {
  CaptureRequirementInput,
  CustomerRequirement,
  RequirementPriority,
} from "./customer.types";

const requirements = new Map<string, CustomerRequirement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRequirement(
  requirement: CustomerRequirement,
): CustomerRequirement {
  return { ...requirement };
}

export function captureRequirement(
  input: CaptureRequirementInput,
): CustomerRequirement {
  const accountId = input.accountId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("requirement.title is required");
  if (!(REQUIREMENT_PRIORITIES as readonly string[]).includes(input.priority)) {
    throw new Error(`invalid requirement priority: ${input.priority}`);
  }

  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const id = input.id?.trim() || createId("creq");
  if (requirements.has(id)) {
    throw new Error(`customer requirement already exists: ${id}`);
  }

  const requirement: CustomerRequirement = {
    id,
    accountId,
    title,
    priority: input.priority,
    description: (input.description ?? "").trim(),
    satisfied: false,
    detail: `priority=${input.priority} title=${title}`,
    createdAt: nowIso(),
  };
  requirements.set(id, requirement);
  return cloneRequirement(requirement);
}

export function satisfyRequirement(id: string): CustomerRequirement {
  const requirement = requirements.get(id.trim());
  if (!requirement) throw new Error(`requirement not found: ${id}`);
  requirement.satisfied = true;
  requirement.detail = `priority=${requirement.priority} satisfied=true`;
  requirements.set(requirement.id, requirement);
  return cloneRequirement(requirement);
}

export function getCustomerRequirement(
  id: string,
): CustomerRequirement | undefined {
  const requirement = requirements.get(id.trim());
  return requirement ? cloneRequirement(requirement) : undefined;
}

export function listCustomerRequirements(filter?: {
  accountId?: string;
  priority?: RequirementPriority;
  satisfied?: boolean;
}): CustomerRequirement[] {
  let result = [...requirements.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((r) => r.accountId === aid);
  }
  if (filter?.priority) {
    result = result.filter((r) => r.priority === filter.priority);
  }
  if (filter?.satisfied !== undefined) {
    result = result.filter((r) => r.satisfied === filter.satisfied);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRequirement);
}

export function clearCustomerRequirements(): void {
  requirements.clear();
}
