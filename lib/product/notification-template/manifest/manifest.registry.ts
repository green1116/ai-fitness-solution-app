/**
 * Product Notification Template — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { getNotificationTemplatePublication } from "../publication/publication.registry";
import { getNotificationTemplate } from "../registry/template.registry";
import { getNotificationTemplateSchema } from "../schema/schema.registry";
import { getNotificationTemplateVariant } from "../variant/variant.registry";

export type NotificationTemplateReleaseManifest = {
  id: string;
  publicationId: string;
  templateKey: string;
  versionTag: string;
  checksum: string;
  variantIds: string[];
  schemaId: string;
  createdAt: string;
};

const releases = new Map<string, NotificationTemplateReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: NotificationTemplateReleaseManifest,
): NotificationTemplateReleaseManifest {
  return { ...release, variantIds: [...release.variantIds] };
}

function checksumPayload(payload: unknown): string {
  const canonical = JSON.stringify(payload);
  return createHash("sha256").update(canonical).digest("hex");
}

export function createNotificationTemplateReleaseManifest(input: {
  id?: string;
  publicationId: string;
}): NotificationTemplateReleaseManifest {
  const publicationId = input.publicationId.trim();
  if (!publicationId) throw new Error("manifest.publicationId is required");

  const publication = getNotificationTemplatePublication(publicationId);
  if (!publication) throw new Error(`publication not found: ${publicationId}`);
  if (publication.state !== "PUBLISHED") {
    throw new Error(`publication not published: ${publicationId}`);
  }

  const template = getNotificationTemplate(publication.templateId);
  if (!template) {
    throw new Error(`template not found: ${publication.templateId}`);
  }

  const schema = getNotificationTemplateSchema(publication.schemaId);
  if (!schema) throw new Error(`schema not found: ${publication.schemaId}`);

  const variants = publication.variantIds.map((id) => {
    const variant = getNotificationTemplateVariant(id);
    if (!variant) throw new Error(`variant not found: ${id}`);
    return {
      id: variant.id,
      locale: variant.locale,
      subject: variant.subject,
      body: variant.body,
    };
  });

  const payload = {
    templateKey: template.templateKey,
    kind: template.kind,
    versionTag: publication.versionTag,
    schema: schema.variables
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
    variants: variants
      .slice()
      .sort((a, b) => a.locale.localeCompare(b.locale)),
  };

  const id = input.id?.trim() || createId("ntplrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: NotificationTemplateReleaseManifest = {
    id,
    publicationId,
    templateKey: template.templateKey,
    versionTag: publication.versionTag,
    checksum: checksumPayload(payload),
    variantIds: [...publication.variantIds].sort((a, b) => a.localeCompare(b)),
    schemaId: publication.schemaId,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getNotificationTemplateReleaseManifest(
  id: string,
): NotificationTemplateReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listNotificationTemplateReleaseManifests(): NotificationTemplateReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearNotificationTemplateReleaseManifests(): void {
  releases.clear();
}
