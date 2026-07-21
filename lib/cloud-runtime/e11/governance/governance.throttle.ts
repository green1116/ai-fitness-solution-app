/**
 * E11-P4 — Throttling Policy
 */

import { THROTTLE_MODES } from "./governance.constants";
import { getTenant } from "../tenant/tenant.namespace";
import type {
  CreateThrottlePolicyInput,
  ThrottleMode,
  ThrottlePolicy,
} from "./governance.types";

const policies = new Map<string, ThrottlePolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: ThrottlePolicy): ThrottlePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function createThrottlePolicy(
  input: CreateThrottlePolicyInput,
): ThrottlePolicy {
  const name = input.name.trim();
  if (!name) throw new Error("throttle policy name is required");

  const mode = input.mode ?? "SOFT";
  if (!(THROTTLE_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid throttle mode: ${mode}`);
  }

  const threshold = input.threshold ?? 0.8;
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error("threshold must be a finite number in [0,1]");
  }

  const tenantId = input.tenantId?.trim();
  if (tenantId && !getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const id = input.id?.trim() || createId("throttle");
  if (policies.has(id)) throw new Error(`throttle policy already exists: ${id}`);

  const policy: ThrottlePolicy = {
    id,
    name,
    mode,
    threshold,
    maxConcurrent: input.maxConcurrent,
    tenantId: tenantId || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getThrottlePolicy(id: string): ThrottlePolicy | undefined {
  const p = policies.get(id.trim());
  return p ? clonePolicy(p) : undefined;
}

export function listThrottlePolicies(filter?: {
  tenantId?: string;
  mode?: ThrottleMode;
}): ThrottlePolicy[] {
  let result = [...policies.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  if (filter?.mode) {
    result = result.filter((p) => p.mode === filter.mode);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

/** Resolve effective policy: tenant-specific first, else global (no tenantId). */
export function resolveThrottlePolicy(
  tenantId?: string,
): ThrottlePolicy | undefined {
  if (tenantId) {
    const specific = listThrottlePolicies({ tenantId: tenantId.trim() });
    if (specific.length > 0) return specific[0];
  }
  const globals = [...policies.values()].filter((p) => !p.tenantId);
  return globals.length > 0 ? clonePolicy(globals[0]!) : undefined;
}

export function clearThrottlePolicies(): void {
  policies.clear();
}
