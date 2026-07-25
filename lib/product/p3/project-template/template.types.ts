/**
 * Product P3 — Project template types
 */

import type { PROJECT_TEMPLATE_KINDS } from "../project/project.constants";

export type ProjectTemplateKind =
  (typeof PROJECT_TEMPLATE_KINDS)[number];
export type TemplateMetadata = Record<string, unknown>;

export type ProjectTemplate = {
  id: string;
  kind: ProjectTemplateKind;
  name: string;
  description: string;
  defaultGoals: string[];
  detail: string;
  metadata: TemplateMetadata;
  createdAt: string;
};

export type RegisterProjectTemplateInput = {
  id?: string;
  kind: ProjectTemplateKind;
  name: string;
  description?: string;
  defaultGoals?: string[];
  metadata?: TemplateMetadata;
};
