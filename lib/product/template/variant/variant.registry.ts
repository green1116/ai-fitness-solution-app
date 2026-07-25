/**
 * Product Template — Variant registry
 */

import { getTemplateDefinition } from "../definition/definition.registry";
import { TEMPLATE_VARIANT_LOCALES } from "../management/management.constants";
import type {
  RegisterTemplateVariantInput,
  TemplateVariant,
  TemplateVariantLocale,
} from "./variant.types";

const variants = new Map<string, TemplateVariant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVariant(variant: TemplateVariant): TemplateVariant {
  return { ...variant, metadata: { ...variant.metadata } };
}

export function registerTemplateVariant(
  input: RegisterTemplateVariantInput,
): TemplateVariant {
  const definitionId = input.definitionId.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!definitionId) throw new Error("variant.definitionId is required");
  if (!subject) throw new Error("variant.subject is required");
  if (!body) throw new Error("variant.body is required");
  if (!(TEMPLATE_VARIANT_LOCALES as readonly string[]).includes(input.locale)) {
    throw new Error(`invalid variant locale: ${input.locale}`);
  }

  const definition = getTemplateDefinition(definitionId);
  if (!definition) throw new Error(`template not found: ${definitionId}`);
  if (definition.status !== "ACTIVE") {
    throw new Error(`template not active: ${definitionId}`);
  }

  const duplicate = [...variants.values()].find(
    (v) => v.definitionId === definitionId && v.locale === input.locale,
  );
  if (duplicate) {
    throw new Error(`variant already exists: ${input.locale}`);
  }

  const id = input.id?.trim() || createId("tplvar");
  if (variants.has(id)) throw new Error(`variant already exists: ${id}`);

  const variant: TemplateVariant = {
    id,
    definitionId,
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

export function getTemplateVariant(id: string): TemplateVariant | undefined {
  const variant = variants.get(id.trim());
  return variant ? cloneVariant(variant) : undefined;
}

export function listTemplateVariants(filter?: {
  definitionId?: string;
  locale?: TemplateVariantLocale;
}): TemplateVariant[] {
  let result = [...variants.values()];
  if (filter?.definitionId) {
    const definitionId = filter.definitionId.trim();
    result = result.filter((v) => v.definitionId === definitionId);
  }
  if (filter?.locale) {
    result = result.filter((v) => v.locale === filter.locale);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVariant);
}

export function clearTemplateVariants(): void {
  variants.clear();
}
