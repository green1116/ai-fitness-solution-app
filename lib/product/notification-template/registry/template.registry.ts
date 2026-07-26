/**
 * Product Notification Template — Template registry
 */

import { NOTIFICATION_TEMPLATE_KINDS } from "../management/management.constants";
import type {
  NotificationTemplate,
  NotificationTemplateKind,
  RegisterNotificationTemplateInput,
} from "./template.types";

const templates = new Map<string, NotificationTemplate>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTemplate(template: NotificationTemplate): NotificationTemplate {
  return { ...template, metadata: { ...template.metadata } };
}

export function registerNotificationTemplate(
  input: RegisterNotificationTemplateInput,
): NotificationTemplate {
  const templateKey = input.templateKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!templateKey) throw new Error("template.templateKey is required");
  if (!name) throw new Error("template.name is required");
  if (!(NOTIFICATION_TEMPLATE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid template kind: ${input.kind}`);
  }
  if (keys.has(templateKey)) {
    throw new Error(`templateKey already exists: ${templateKey}`);
  }

  const id = input.id?.trim() || createId("ntpl");
  if (templates.has(id)) throw new Error(`template already exists: ${id}`);

  const now = nowIso();
  const template: NotificationTemplate = {
    id,
    templateKey,
    name,
    kind: input.kind,
    detail: `key=${templateKey} kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  templates.set(id, template);
  keys.set(templateKey, id);
  return cloneTemplate(template);
}

export function getNotificationTemplate(
  id: string,
): NotificationTemplate | undefined {
  const template = templates.get(id.trim());
  return template ? cloneTemplate(template) : undefined;
}

export function getNotificationTemplateByKey(
  templateKey: string,
): NotificationTemplate | undefined {
  const id = keys.get(templateKey.trim().toUpperCase());
  return id ? getNotificationTemplate(id) : undefined;
}

export function listNotificationTemplates(filter?: {
  kind?: NotificationTemplateKind;
}): NotificationTemplate[] {
  let result = [...templates.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.templateKey.localeCompare(b.templateKey))
    .map(cloneTemplate);
}

export function clearNotificationTemplates(): void {
  templates.clear();
  keys.clear();
}
