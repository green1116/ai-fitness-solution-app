/**
 * Product Notification — Message registry
 */

import { NOTIFICATION_MESSAGE_PRIORITIES } from "../foundation/foundation.constants";
import { getNotificationTemplate } from "../template/template.registry";
import type {
  ComposeNotificationMessageInput,
  NotificationMessage,
  NotificationMessagePriority,
} from "./message.types";

const messages = new Map<string, NotificationMessage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMessage(message: NotificationMessage): NotificationMessage {
  return { ...message, metadata: { ...message.metadata } };
}

export function composeNotificationMessage(
  input: ComposeNotificationMessageInput,
): NotificationMessage {
  const templateId = input.templateId.trim();
  const recipient = input.recipient.trim();
  if (!templateId) throw new Error("message.templateId is required");
  if (!recipient) throw new Error("message.recipient is required");
  if (!getNotificationTemplate(templateId)) {
    throw new Error(`template not found: ${templateId}`);
  }

  const priority = input.priority ?? NOTIFICATION_MESSAGE_PRIORITIES[1];
  if (
    !(NOTIFICATION_MESSAGE_PRIORITIES as readonly string[]).includes(priority)
  ) {
    throw new Error(`invalid message priority: ${priority}`);
  }

  const id = input.id?.trim() || createId("ntfmsg");
  if (messages.has(id)) throw new Error(`message already exists: ${id}`);

  const payload = (input.payload ?? "").trim();
  const message: NotificationMessage = {
    id,
    templateId,
    recipient,
    priority,
    payload,
    detail: `priority=${priority} recipient=${recipient}`,
    metadata: { ...(input.metadata ?? {}) },
    composedAt: nowIso(),
  };
  messages.set(id, message);
  return cloneMessage(message);
}

export function getNotificationMessage(
  id: string,
): NotificationMessage | undefined {
  const message = messages.get(id.trim());
  return message ? cloneMessage(message) : undefined;
}

export function listNotificationMessages(filter?: {
  templateId?: string;
  priority?: NotificationMessagePriority;
}): NotificationMessage[] {
  let result = [...messages.values()];
  if (filter?.templateId) {
    const templateId = filter.templateId.trim();
    result = result.filter((m) => m.templateId === templateId);
  }
  if (filter?.priority) {
    result = result.filter((m) => m.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMessage);
}

export function clearNotificationMessages(): void {
  messages.clear();
}
