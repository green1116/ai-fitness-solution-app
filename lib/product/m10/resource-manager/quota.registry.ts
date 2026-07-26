/**
 * Product M10 — AI Resource quota registry (definition only)
 */

import { AI_RESOURCE_QUOTA_STATUSES } from "./resource.constants";
import { getAiResource } from "./resource.registry";
import type {
  AiResourceQuota,
  AiResourceQuotaStatus,
  RegisterAiResourceQuotaInput,
  UpdateAiResourceQuotaStatusInput,
} from "./resource.types";

const quotas = new Map<string, AiResourceQuota>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuota(quota: AiResourceQuota): AiResourceQuota {
  return { ...quota, metadata: { ...quota.metadata } };
}

export function registerAiResourceQuota(
  input: RegisterAiResourceQuotaInput,
): AiResourceQuota {
  const resourceId = input.resourceId.trim();
  const quotaKey = input.quotaKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!resourceId) throw new Error("quota.resourceId is required");
  if (!quotaKey) throw new Error("quota.quotaKey is required");
  if (!summary) throw new Error("quota.summary is required");
  if (!Number.isFinite(input.limit) || input.limit <= 0) {
    throw new Error("quota.limit must be a positive number");
  }

  const resource = getAiResource(resourceId);
  if (!resource) throw new Error(`resource not found: ${resourceId}`);
  if (resource.status !== "ACTIVE" && resource.status !== "DRAFT") {
    throw new Error(`resource not editable: ${resourceId}`);
  }

  const duplicate = [...quotas.values()].find(
    (q) => q.resourceId === resourceId && q.quotaKey === quotaKey,
  );
  if (duplicate) {
    throw new Error(`quotaKey already exists: ${quotaKey}`);
  }

  const id = input.id?.trim() || createId("aiquota");
  if (quotas.has(id)) throw new Error(`quota already exists: ${id}`);

  const now = nowIso();
  const quota: AiResourceQuota = {
    id,
    resourceId,
    quotaKey,
    limit: input.limit,
    status: AI_RESOURCE_QUOTA_STATUSES[0],
    summary,
    detail: `limit=${input.limit} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  quotas.set(id, quota);
  return cloneQuota(quota);
}

export function updateAiResourceQuotaStatus(
  input: UpdateAiResourceQuotaStatusInput,
): AiResourceQuota {
  const quotaId = input.quotaId.trim();
  if (!quotaId) throw new Error("quota.quotaId is required");
  if (
    !(AI_RESOURCE_QUOTA_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid quota status: ${input.status}`);
  }

  const existing = quotas.get(quotaId);
  if (!existing) throw new Error(`quota not found: ${quotaId}`);

  const updated: AiResourceQuota = {
    ...existing,
    status: input.status,
    detail: `limit=${existing.limit} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  quotas.set(quotaId, updated);
  return cloneQuota(updated);
}

export function getAiResourceQuota(id: string): AiResourceQuota | undefined {
  const quota = quotas.get(id.trim());
  return quota ? cloneQuota(quota) : undefined;
}

export function listAiResourceQuotas(filter?: {
  resourceId?: string;
  status?: AiResourceQuotaStatus;
}): AiResourceQuota[] {
  let result = [...quotas.values()];
  if (filter?.resourceId) {
    const resourceId = filter.resourceId.trim();
    result = result.filter((q) => q.resourceId === resourceId);
  }
  if (filter?.status) {
    result = result.filter((q) => q.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.quotaKey.localeCompare(b.quotaKey))
    .map(cloneQuota);
}

export function clearAiResourceQuotas(): void {
  quotas.clear();
}
