/**
 * Product Admin — Policy registry
 */

import {
  ADMIN_POLICY_EFFECTS,
  ADMIN_POLICY_STATUSES,
} from "../foundation/foundation.constants";
import { getAdminSetting } from "../setting/setting.registry";
import { getAdminTenant } from "../tenant/tenant.registry";
import type {
  AdminPolicy,
  AdminPolicyEffect,
  AdminPolicyStatus,
  EnforceAdminPolicyInput,
  RegisterAdminPolicyInput,
} from "./policy.types";

const policies = new Map<string, AdminPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: AdminPolicy): AdminPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerAdminPolicy(
  input: RegisterAdminPolicyInput,
): AdminPolicy {
  const code = input.code.trim().toUpperCase();
  const settingId = input.settingId.trim();
  const tenantId = input.tenantId.trim();
  if (!code) throw new Error("policy.code is required");
  if (!settingId) throw new Error("policy.settingId is required");
  if (!tenantId) throw new Error("policy.tenantId is required");
  if (!(ADMIN_POLICY_EFFECTS as readonly string[]).includes(input.effect)) {
    throw new Error(`invalid policy effect: ${input.effect}`);
  }
  if (!getAdminSetting(settingId)) {
    throw new Error(`setting not found: ${settingId}`);
  }
  if (!getAdminTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const duplicate = [...policies.values()].find((p) => p.code === code);
  if (duplicate) throw new Error(`policy code already exists: ${code}`);

  const id = input.id?.trim() || createId("admpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: AdminPolicy = {
    id,
    code,
    effect: input.effect,
    status: ADMIN_POLICY_STATUSES[0],
    settingId,
    tenantId,
    detail: `effect=${input.effect} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function enforceAdminPolicy(
  input: EnforceAdminPolicyInput,
): AdminPolicy {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("policy.policyId is required");

  const existing = policies.get(policyId);
  if (!existing) throw new Error(`policy not found: ${policyId}`);

  const updated: AdminPolicy = {
    ...existing,
    status: "ENFORCED",
    detail: `effect=${existing.effect} status=ENFORCED`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  policies.set(policyId, updated);
  return clonePolicy(updated);
}

export function getAdminPolicy(id: string): AdminPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listAdminPolicies(filter?: {
  effect?: AdminPolicyEffect;
  status?: AdminPolicyStatus;
  tenantId?: string;
}): AdminPolicy[] {
  let result = [...policies.values()];
  if (filter?.effect) {
    result = result.filter((p) => p.effect === filter.effect);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  if (filter?.tenantId) {
    const tenantId = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tenantId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearAdminPolicies(): void {
  policies.clear();
}
