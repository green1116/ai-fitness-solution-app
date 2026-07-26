/**
 * Product Notification Template — Pure renderer (side-effect free)
 */

import type { NotificationTemplateSchema } from "../schema/schema.types";
import type { NotificationTemplateVariant } from "../variant/variant.types";

export type RenderNotificationTemplateInput = {
  variant: NotificationTemplateVariant;
  schema: NotificationTemplateSchema;
  values: Record<string, string | number | boolean>;
};

export type RenderNotificationTemplateResult = {
  subject: string;
  body: string;
  usedVariables: string[];
};

function substitute(
  text: string,
  resolved: Record<string, string>,
): string {
  return text.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_m, raw: string) => {
    const key = raw.toUpperCase();
    if (!(key in resolved)) {
      throw new Error(`unresolved variable: ${key}`);
    }
    return resolved[key];
  });
}

export function renderNotificationTemplate(
  input: RenderNotificationTemplateInput,
): RenderNotificationTemplateResult {
  if (input.variant.templateId !== input.schema.templateId) {
    throw new Error("renderer templateId mismatch");
  }

  const resolved: Record<string, string> = {};
  const usedVariables: string[] = [];

  for (const variable of input.schema.variables) {
    const raw = input.values[variable.name];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      if (variable.required) {
        throw new Error(`missing required variable: ${variable.name}`);
      }
      if (variable.defaultValue !== undefined) {
        resolved[variable.name] = variable.defaultValue;
        usedVariables.push(variable.name);
      }
      continue;
    }
    resolved[variable.name] = String(raw);
    usedVariables.push(variable.name);
  }

  return {
    subject: substitute(input.variant.subject, resolved),
    body: substitute(input.variant.body, resolved),
    usedVariables: usedVariables.slice().sort((a, b) => a.localeCompare(b)),
  };
}
