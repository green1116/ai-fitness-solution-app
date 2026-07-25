/**
 * Product Template — Variant types
 */

import type { TEMPLATE_VARIANT_LOCALES } from "../management/management.constants";

export type TemplateVariantLocale =
  (typeof TEMPLATE_VARIANT_LOCALES)[number];
export type VariantMetadata = Record<string, unknown>;

export type TemplateVariant = {
  id: string;
  definitionId: string;
  locale: TemplateVariantLocale;
  subject: string;
  body: string;
  detail: string;
  metadata: VariantMetadata;
  createdAt: string;
};

export type RegisterTemplateVariantInput = {
  id?: string;
  definitionId: string;
  locale: TemplateVariantLocale;
  subject: string;
  body: string;
  metadata?: VariantMetadata;
};
