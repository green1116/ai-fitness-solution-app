/**
 * Launch P5 — Support Policy
 */

import { SUPPORT_POLICY_KINDS } from "./support.constants";
import { getSupportSlaProfile } from "./support.profile";
import type {
  CreateSupportPolicyInput,
  SupportPolicy,
  SupportPolicyKind,
} from "./support.types";

const policies = new Map<string, SupportPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: SupportPolicy): SupportPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function createSupportPolicy(
  input: CreateSupportPolicyInput,
): SupportPolicy {
  const supportSlaProfileId = input.supportSlaProfileId.trim();
  const name = input.name.trim();
  const kind = input.kind;

  if (!name) throw new Error("supportPolicy.name is required");
  if (!(SUPPORT_POLICY_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid support policy kind: ${kind}`);
  }
  if (input.valueMinutes <= 0) {
    throw new Error("supportPolicy.valueMinutes must be positive");
  }
  if (!getSupportSlaProfile(supportSlaProfileId)) {
    throw new Error(`support sla profile not found: ${supportSlaProfileId}`);
  }

  const id = input.id?.trim() || createId("suppolicy");
  if (policies.has(id)) throw new Error(`support policy already exists: ${id}`);

  const policy: SupportPolicy = {
    id,
    supportSlaProfileId,
    kind,
    name,
    valueMinutes: input.valueMinutes,
    detail: input.detail?.trim() || `${kind}=${input.valueMinutes}m`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getSupportPolicy(id: string): SupportPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listSupportPolicies(filter?: {
  supportSlaProfileId?: string;
  kind?: SupportPolicyKind;
}): SupportPolicy[] {
  let result = [...policies.values()];
  if (filter?.supportSlaProfileId) {
    const pid = filter.supportSlaProfileId.trim();
    result = result.filter((p) => p.supportSlaProfileId === pid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearSupportPolicies(): void {
  policies.clear();
}
