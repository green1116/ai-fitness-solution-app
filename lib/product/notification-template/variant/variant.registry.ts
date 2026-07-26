/**
 * Product Notification Template — Variant registry
 */

import { NOTIFICATION_TEMPLATE_LOCALES } from "../management/management.constants";
import { getNotificationTemplate } from "../registry/template.registry";
import type {
  NotificationTemplateLocale,
  NotificationTemplateVariant,
  RegisterNotificationTemplateVariantInput,
} from "./variant.types";

const variants = new Map<string, NotificationTemplateVariant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVariant(
  variant: NotificationTemplateVariant,
): NotificationTemplateVariant {
  return { ...variant, metadata: { ...variant.metadata } };
}

export function registerNotificationTemplateVariant(
  input: RegisterNotificationTemplateVariantInput,
): NotificationTemplateVariant {
  const templateId = input.templateId.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!templateId) throw new Error("variant.templateId is required");
  if (!subject) throw new Error("variant.subject is required");
  if (!body) throw new Error("variant.body is required");
  if (
    !(NOTIFICATION_TEMPLATE_LOCALES as readonly string[]).includes(input.locale)
  ) {
    throw new Error(`invalid variant locale: ${input.locale}`);
  }
  if (!getNotificationTemplate(templateId)) {
    throw new Error(`template not found: ${templateId}`);
  }

  const duplicate = [...variants.values()].find(
    (v) => v.templateId === templateId && v.locale === input.locale,
  );
  if (duplicate) {
    throw new Error(`variant already exists: ${input.locale}`);
  }

  const id = input.id?.trim() || createId("ntplvar");
  if (variants.has(id)) throw new Error(`variant already exists: ${id}`);

  const variant: NotificationTemplateVariant = {
    id,
    templateId,
    locale: input.locale,
    subject,
    body,
    detail: `locale=${input.locale}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  variants.set(id, variant);
  return cloneVariant(variant);
}

export function getNotificationTemplateVariant(
  id: string,
): NotificationTemplateVariant | undefined {
  const variant = variants.get(id.trim());
  return variant ? cloneVariant(variant) : undefined;
}

export function listNotificationTemplateVariants(filter?: {
  templateId?: string;
  locale?: NotificationTemplateLocale;
}): NotificationTemplateVariant[] {
  let result = [...variants.values()];
  if (filter?.templateId) {
    const templateId = filter.templateId.trim();
    result = result.filter((v) => v.templateId === templateId);
  }
  if (filter?.locale) {
    result = result.filter((v) => v.locale === filter.locale);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVariant);
}

export function clearNotificationTemplateVariants(): void {
  variants.clear();
}
