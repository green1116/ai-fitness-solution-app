/**
 * Product Notification — Template registry
 */

import { getNotificationChannel } from "../channel/channel.registry";
import { NOTIFICATION_TEMPLATE_KINDS } from "../foundation/foundation.constants";
import type {
  NotificationTemplate,
  NotificationTemplateKind,
  RegisterNotificationTemplateInput,
} from "./template.types";

const templates = new Map<string, NotificationTemplate>();

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
  const code = input.code.trim().toUpperCase();
  const channelId = input.channelId.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!code) throw new Error("template.code is required");
  if (!channelId) throw new Error("template.channelId is required");
  if (!subject) throw new Error("template.subject is required");
  if (!body) throw new Error("template.body is required");
  if (
    !(NOTIFICATION_TEMPLATE_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid template kind: ${input.kind}`);
  }

  const channel = getNotificationChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.status !== "ACTIVE") {
    throw new Error(`channel not active: ${channelId}`);
  }

  const duplicate = [...templates.values()].find((t) => t.code === code);
  if (duplicate) throw new Error(`template code already exists: ${code}`);

  const id = input.id?.trim() || createId("ntftpl");
  if (templates.has(id)) throw new Error(`template already exists: ${id}`);

  const template: NotificationTemplate = {
    id,
    code,
    channelId,
    kind: input.kind,
    subject,
    body,
    detail: `kind=${input.kind} channel=${channelId}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  templates.set(id, template);
  return cloneTemplate(template);
}

export function getNotificationTemplate(
  id: string,
): NotificationTemplate | undefined {
  const template = templates.get(id.trim());
  return template ? cloneTemplate(template) : undefined;
}

export function listNotificationTemplates(filter?: {
  channelId?: string;
  kind?: NotificationTemplateKind;
}): NotificationTemplate[] {
  let result = [...templates.values()];
  if (filter?.channelId) {
    const channelId = filter.channelId.trim();
    result = result.filter((t) => t.channelId === channelId);
  }
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTemplate);
}

export function clearNotificationTemplates(): void {
  templates.clear();
}
