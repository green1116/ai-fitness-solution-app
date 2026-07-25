/**
 * Product Template — Variable registry
 */

import { getTemplateDefinition } from "../definition/definition.registry";
import { TEMPLATE_VARIABLE_TYPES } from "../management/management.constants";
import type {
  DeclareTemplateVariableInput,
  TemplateVariable,
  TemplateVariableType,
} from "./variable.types";

const variables = new Map<string, TemplateVariable>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVariable(variable: TemplateVariable): TemplateVariable {
  return { ...variable, metadata: { ...variable.metadata } };
}

export function declareTemplateVariable(
  input: DeclareTemplateVariableInput,
): TemplateVariable {
  const definitionId = input.definitionId.trim();
  const key = input.key.trim().toUpperCase();
  if (!definitionId) throw new Error("variable.definitionId is required");
  if (!key) throw new Error("variable.key is required");
  if (!(TEMPLATE_VARIABLE_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`invalid variable type: ${input.type}`);
  }
  if (!getTemplateDefinition(definitionId)) {
    throw new Error(`template not found: ${definitionId}`);
  }

  const duplicate = [...variables.values()].find(
    (v) => v.definitionId === definitionId && v.key === key,
  );
  if (duplicate) throw new Error(`variable already exists: ${key}`);

  const id = input.id?.trim() || createId("tplkey");
  if (variables.has(id)) throw new Error(`variable already exists: ${id}`);

  const variable: TemplateVariable = {
    id,
    definitionId,
    key,
    type: input.type,
    required: input.required ?? true,
    detail: `type=${input.type} key=${key}`,
    metadata: { ...(input.metadata ?? {}) },
    declaredAt: nowIso(),
  };
  variables.set(id, variable);
  return cloneVariable(variable);
}

export function getTemplateVariable(id: string): TemplateVariable | undefined {
  const variable = variables.get(id.trim());
  return variable ? cloneVariable(variable) : undefined;
}

export function listTemplateVariables(filter?: {
  definitionId?: string;
  type?: TemplateVariableType;
}): TemplateVariable[] {
  let result = [...variables.values()];
  if (filter?.definitionId) {
    const definitionId = filter.definitionId.trim();
    result = result.filter((v) => v.definitionId === definitionId);
  }
  if (filter?.type) result = result.filter((v) => v.type === filter.type);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVariable);
}

export function clearTemplateVariables(): void {
  variables.clear();
}
