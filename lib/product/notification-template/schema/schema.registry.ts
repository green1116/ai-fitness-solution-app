/**
 * Product Notification Template — Variable schema registry
 */

import { NOTIFICATION_TEMPLATE_VARIABLE_TYPES } from "../management/management.constants";
import { getNotificationTemplate } from "../registry/template.registry";
import type {
  DeclareNotificationTemplateSchemaInput,
  NotificationTemplateSchema,
  NotificationTemplateVariable,
} from "./schema.types";

const schemas = new Map<string, NotificationTemplateSchema>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVariable(
  variable: NotificationTemplateVariable,
): NotificationTemplateVariable {
  return { ...variable };
}

function cloneSchema(
  schema: NotificationTemplateSchema,
): NotificationTemplateSchema {
  return {
    ...schema,
    variables: schema.variables.map(cloneVariable),
    metadata: { ...schema.metadata },
  };
}

function normalizeVariables(
  variables: NotificationTemplateVariable[],
): NotificationTemplateVariable[] {
  if (!variables.length) throw new Error("schema.variables is required");
  const names = new Set<string>();
  const normalized: NotificationTemplateVariable[] = [];
  for (const raw of variables) {
    const name = raw.name.trim().toUpperCase();
    const description = raw.description.trim();
    if (!name) throw new Error("schema.variable.name is required");
    if (!description) throw new Error("schema.variable.description is required");
    if (
      !(NOTIFICATION_TEMPLATE_VARIABLE_TYPES as readonly string[]).includes(
        raw.type,
      )
    ) {
      throw new Error(`invalid variable type: ${raw.type}`);
    }
    if (names.has(name)) throw new Error(`duplicate variable name: ${name}`);
    names.add(name);
    const entry: NotificationTemplateVariable = {
      name,
      type: raw.type,
      required: raw.required === true,
      description,
    };
    if (raw.defaultValue !== undefined) {
      entry.defaultValue = String(raw.defaultValue);
    }
    if (entry.required && entry.defaultValue !== undefined) {
      throw new Error(`required variable cannot have defaultValue: ${name}`);
    }
    normalized.push(entry);
  }
  return normalized;
}

export function declareNotificationTemplateSchema(
  input: DeclareNotificationTemplateSchemaInput,
): NotificationTemplateSchema {
  const templateId = input.templateId.trim();
  if (!templateId) throw new Error("schema.templateId is required");
  if (!getNotificationTemplate(templateId)) {
    throw new Error(`template not found: ${templateId}`);
  }

  const duplicate = [...schemas.values()].find(
    (s) => s.templateId === templateId,
  );
  if (duplicate) throw new Error(`schema already exists: ${templateId}`);

  const id = input.id?.trim() || createId("ntplsch");
  if (schemas.has(id)) throw new Error(`schema already exists: ${id}`);

  const variables = normalizeVariables(input.variables);
  const schema: NotificationTemplateSchema = {
    id,
    templateId,
    variables,
    detail: `variables=${variables.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  schemas.set(id, schema);
  return cloneSchema(schema);
}

export function getNotificationTemplateSchema(
  id: string,
): NotificationTemplateSchema | undefined {
  const schema = schemas.get(id.trim());
  return schema ? cloneSchema(schema) : undefined;
}

export function listNotificationTemplateSchemas(filter?: {
  templateId?: string;
}): NotificationTemplateSchema[] {
  let result = [...schemas.values()];
  if (filter?.templateId) {
    const templateId = filter.templateId.trim();
    result = result.filter((s) => s.templateId === templateId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSchema);
}

export function clearNotificationTemplateSchemas(): void {
  schemas.clear();
}
