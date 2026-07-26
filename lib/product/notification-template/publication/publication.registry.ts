/**
 * Product Notification Template — Publication registry + lifecycle control
 */

import { NOTIFICATION_TEMPLATE_VERSION_STATES } from "../management/management.constants";
import { getNotificationTemplate } from "../registry/template.registry";
import { getNotificationTemplateSchema } from "../schema/schema.registry";
import { getNotificationTemplateVariant } from "../variant/variant.registry";
import type {
  CreateNotificationTemplatePublicationInput,
  NotificationTemplatePublication,
  NotificationTemplateVersionState,
  TransitionNotificationTemplatePublicationInput,
} from "./publication.types";

const publications = new Map<string, NotificationTemplatePublication>();

const ALLOWED: Record<
  NotificationTemplateVersionState,
  readonly NotificationTemplateVersionState[]
> = {
  DRAFT: ["REVIEW"],
  REVIEW: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePublication(
  publication: NotificationTemplatePublication,
): NotificationTemplatePublication {
  return {
    ...publication,
    variantIds: [...publication.variantIds],
    metadata: { ...publication.metadata },
  };
}

export function createNotificationTemplatePublication(
  input: CreateNotificationTemplatePublicationInput,
): NotificationTemplatePublication {
  const templateId = input.templateId.trim();
  const versionTag = input.versionTag.trim();
  const schemaId = input.schemaId.trim();
  if (!templateId) throw new Error("publication.templateId is required");
  if (!versionTag) throw new Error("publication.versionTag is required");
  if (!schemaId) throw new Error("publication.schemaId is required");
  if (!input.variantIds.length) {
    throw new Error("publication.variantIds is required");
  }
  if (!getNotificationTemplate(templateId)) {
    throw new Error(`template not found: ${templateId}`);
  }

  const schema = getNotificationTemplateSchema(schemaId);
  if (!schema) throw new Error(`schema not found: ${schemaId}`);
  if (schema.templateId !== templateId) {
    throw new Error(`schema template mismatch: ${schemaId}`);
  }

  const variantIds = input.variantIds.map((id) => id.trim()).filter(Boolean);
  for (const variantId of variantIds) {
    const variant = getNotificationTemplateVariant(variantId);
    if (!variant) throw new Error(`variant not found: ${variantId}`);
    if (variant.templateId !== templateId) {
      throw new Error(`variant template mismatch: ${variantId}`);
    }
  }

  const duplicate = [...publications.values()].find(
    (p) => p.templateId === templateId && p.versionTag === versionTag,
  );
  if (duplicate) {
    throw new Error(`publication version already exists: ${versionTag}`);
  }

  const id = input.id?.trim() || createId("ntplpub");
  if (publications.has(id)) {
    throw new Error(`publication already exists: ${id}`);
  }

  const now = nowIso();
  const publication: NotificationTemplatePublication = {
    id,
    templateId,
    versionTag,
    variantIds,
    schemaId,
    state: NOTIFICATION_TEMPLATE_VERSION_STATES[0],
    detail: `state=DRAFT version=${versionTag}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  publications.set(id, publication);
  return clonePublication(publication);
}

export function transitionNotificationTemplatePublication(
  input: TransitionNotificationTemplatePublicationInput,
): NotificationTemplatePublication {
  const publicationId = input.publicationId.trim();
  if (!publicationId) {
    throw new Error("publication.publicationId is required");
  }
  if (
    !(NOTIFICATION_TEMPLATE_VERSION_STATES as readonly string[]).includes(
      input.state,
    )
  ) {
    throw new Error(`invalid publication state: ${input.state}`);
  }

  const existing = publications.get(publicationId);
  if (!existing) throw new Error(`publication not found: ${publicationId}`);

  if (existing.state === "ARCHIVED") {
    throw new Error("archived cannot republish");
  }

  const allowed = ALLOWED[existing.state];
  if (!allowed.includes(input.state)) {
    throw new Error(
      `invalid transition: ${existing.state} -> ${input.state}`,
    );
  }

  const updated: NotificationTemplatePublication = {
    ...existing,
    state: input.state,
    variantIds: [...existing.variantIds],
    detail: `state=${input.state} version=${existing.versionTag}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  publications.set(publicationId, updated);
  return clonePublication(updated);
}

export function getNotificationTemplatePublication(
  id: string,
): NotificationTemplatePublication | undefined {
  const publication = publications.get(id.trim());
  return publication ? clonePublication(publication) : undefined;
}

export function listNotificationTemplatePublications(filter?: {
  templateId?: string;
  state?: NotificationTemplateVersionState;
}): NotificationTemplatePublication[] {
  let result = [...publications.values()];
  if (filter?.templateId) {
    const templateId = filter.templateId.trim();
    result = result.filter((p) => p.templateId === templateId);
  }
  if (filter?.state) {
    result = result.filter((p) => p.state === filter.state);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePublication);
}

export function clearNotificationTemplatePublications(): void {
  publications.clear();
}
