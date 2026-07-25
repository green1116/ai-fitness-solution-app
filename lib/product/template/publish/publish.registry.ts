/**
 * Product Template — Publish registry
 */

import { getTemplateDefinition } from "../definition/definition.registry";
import { TEMPLATE_PUBLISH_STATUSES } from "../management/management.constants";
import { getTemplateVariant } from "../variant/variant.registry";
import type {
  CreateTemplatePublishInput,
  TemplatePublish,
  TemplatePublishStatus,
  UpdateTemplatePublishStatusInput,
} from "./publish.types";

const publishes = new Map<string, TemplatePublish>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePublish(publish: TemplatePublish): TemplatePublish {
  return {
    ...publish,
    variantIds: [...publish.variantIds],
    metadata: { ...publish.metadata },
  };
}

export function createTemplatePublish(
  input: CreateTemplatePublishInput,
): TemplatePublish {
  const definitionId = input.definitionId.trim();
  const versionTag = input.versionTag.trim();
  if (!definitionId) throw new Error("publish.definitionId is required");
  if (!versionTag) throw new Error("publish.versionTag is required");
  if (!input.variantIds.length) {
    throw new Error("publish.variantIds is required");
  }

  const definition = getTemplateDefinition(definitionId);
  if (!definition) throw new Error(`template not found: ${definitionId}`);
  if (definition.status !== "ACTIVE") {
    throw new Error(`template not active: ${definitionId}`);
  }

  const variantIds = input.variantIds.map((id) => id.trim()).filter(Boolean);
  for (const variantId of variantIds) {
    const variant = getTemplateVariant(variantId);
    if (!variant) throw new Error(`variant not found: ${variantId}`);
    if (variant.definitionId !== definitionId) {
      throw new Error(`variant definition mismatch: ${variantId}`);
    }
  }

  const duplicate = [...publishes.values()].find(
    (p) => p.definitionId === definitionId && p.versionTag === versionTag,
  );
  if (duplicate) {
    throw new Error(`publish version already exists: ${versionTag}`);
  }

  const id = input.id?.trim() || createId("tplpub");
  if (publishes.has(id)) throw new Error(`publish already exists: ${id}`);

  const now = nowIso();
  const publish: TemplatePublish = {
    id,
    definitionId,
    versionTag,
    variantIds,
    status: TEMPLATE_PUBLISH_STATUSES[0],
    detail: `version=${versionTag} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  publishes.set(id, publish);
  return clonePublish(publish);
}

export function updateTemplatePublishStatus(
  input: UpdateTemplatePublishStatusInput,
): TemplatePublish {
  const publishId = input.publishId.trim();
  if (!publishId) throw new Error("publish.publishId is required");
  if (
    !(TEMPLATE_PUBLISH_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid publish status: ${input.status}`);
  }

  const existing = publishes.get(publishId);
  if (!existing) throw new Error(`publish not found: ${publishId}`);

  const updated: TemplatePublish = {
    ...existing,
    status: input.status,
    variantIds: [...existing.variantIds],
    detail: `version=${existing.versionTag} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  publishes.set(publishId, updated);
  return clonePublish(updated);
}

export function getTemplatePublish(id: string): TemplatePublish | undefined {
  const publish = publishes.get(id.trim());
  return publish ? clonePublish(publish) : undefined;
}

export function listTemplatePublishes(filter?: {
  definitionId?: string;
  status?: TemplatePublishStatus;
}): TemplatePublish[] {
  let result = [...publishes.values()];
  if (filter?.definitionId) {
    const definitionId = filter.definitionId.trim();
    result = result.filter((p) => p.definitionId === definitionId);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePublish);
}

export function clearTemplatePublishes(): void {
  publishes.clear();
}
