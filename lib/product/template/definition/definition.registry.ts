/**
 * Product Template — Definition registry
 */

import {
  TEMPLATE_DEFINITION_KINDS,
  TEMPLATE_DEFINITION_STATUSES,
} from "../management/management.constants";
import type {
  DefineTemplateInput,
  TemplateDefinition,
  TemplateDefinitionKind,
  TemplateDefinitionStatus,
  UpdateTemplateDefinitionStatusInput,
} from "./definition.types";

const definitions = new Map<string, TemplateDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(
  definition: TemplateDefinition,
): TemplateDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function defineTemplate(
  input: DefineTemplateInput,
): TemplateDefinition {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const foundationTemplateId = input.foundationTemplateId.trim();
  if (!code) throw new Error("definition.code is required");
  if (!name) throw new Error("definition.name is required");
  if (!foundationTemplateId) {
    throw new Error("definition.foundationTemplateId is required");
  }
  if (!(TEMPLATE_DEFINITION_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid template kind: ${input.kind}`);
  }

  const duplicate = [...definitions.values()].find((d) => d.code === code);
  if (duplicate) throw new Error(`template code already exists: ${code}`);

  const id = input.id?.trim() || createId("tpldef");
  if (definitions.has(id)) throw new Error(`template already exists: ${id}`);

  const now = nowIso();
  const definition: TemplateDefinition = {
    id,
    code,
    name,
    kind: input.kind,
    foundationTemplateId,
    status: TEMPLATE_DEFINITION_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function updateTemplateDefinitionStatus(
  input: UpdateTemplateDefinitionStatusInput,
): TemplateDefinition {
  const definitionId = input.definitionId.trim();
  if (!definitionId) throw new Error("definition.definitionId is required");
  if (
    !(TEMPLATE_DEFINITION_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid template status: ${input.status}`);
  }

  const existing = definitions.get(definitionId);
  if (!existing) throw new Error(`template not found: ${definitionId}`);

  const updated: TemplateDefinition = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  definitions.set(definitionId, updated);
  return cloneDefinition(updated);
}

export function getTemplateDefinition(
  id: string,
): TemplateDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listTemplateDefinitions(filter?: {
  kind?: TemplateDefinitionKind;
  status?: TemplateDefinitionStatus;
}): TemplateDefinition[] {
  let result = [...definitions.values()];
  if (filter?.kind) result = result.filter((d) => d.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDefinition);
}

export function clearTemplateDefinitions(): void {
  definitions.clear();
}
