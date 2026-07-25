/**
 * Product Template — Definition types
 */

import type {
  TEMPLATE_DEFINITION_KINDS,
  TEMPLATE_DEFINITION_STATUSES,
} from "../management/management.constants";

export type TemplateDefinitionKind =
  (typeof TEMPLATE_DEFINITION_KINDS)[number];
export type TemplateDefinitionStatus =
  (typeof TEMPLATE_DEFINITION_STATUSES)[number];
export type DefinitionMetadata = Record<string, unknown>;

export type TemplateDefinition = {
  id: string;
  code: string;
  name: string;
  kind: TemplateDefinitionKind;
  foundationTemplateId: string;
  status: TemplateDefinitionStatus;
  detail: string;
  metadata: DefinitionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type DefineTemplateInput = {
  id?: string;
  code: string;
  name: string;
  kind: TemplateDefinitionKind;
  foundationTemplateId: string;
  metadata?: DefinitionMetadata;
};

export type UpdateTemplateDefinitionStatusInput = {
  definitionId: string;
  status: TemplateDefinitionStatus;
};
