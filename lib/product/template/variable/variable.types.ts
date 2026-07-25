/**
 * Product Template — Variable types
 */

import type { TEMPLATE_VARIABLE_TYPES } from "../management/management.constants";

export type TemplateVariableType = (typeof TEMPLATE_VARIABLE_TYPES)[number];
export type VariableMetadata = Record<string, unknown>;

export type TemplateVariable = {
  id: string;
  definitionId: string;
  key: string;
  type: TemplateVariableType;
  required: boolean;
  detail: string;
  metadata: VariableMetadata;
  declaredAt: string;
};

export type DeclareTemplateVariableInput = {
  id?: string;
  definitionId: string;
  key: string;
  type: TemplateVariableType;
  required?: boolean;
  metadata?: VariableMetadata;
};
