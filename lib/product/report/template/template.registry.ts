/**
 * Product Report — Template registry
 */

import { REPORT_TEMPLATE_KINDS } from "../engine/engine.constants";
import type {
  RegisterTemplateInput,
  ReportTemplate,
  ReportTemplateKind,
} from "./template.types";

const templates = new Map<string, ReportTemplate>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTemplate(template: ReportTemplate): ReportTemplate {
  return { ...template, metadata: { ...template.metadata } };
}

export function registerTemplate(
  input: RegisterTemplateInput,
): ReportTemplate {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const boardId = input.boardId.trim();
  if (!code) throw new Error("template.code is required");
  if (!name) throw new Error("template.name is required");
  if (!boardId) throw new Error("template.boardId is required");
  if (!(REPORT_TEMPLATE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid report template kind: ${input.kind}`);
  }

  const duplicate = [...templates.values()].find((t) => t.code === code);
  if (duplicate) throw new Error(`template code already exists: ${code}`);

  const id = input.id?.trim() || createId("rpttpl");
  if (templates.has(id)) throw new Error(`template already exists: ${id}`);

  const template: ReportTemplate = {
    id,
    code,
    name,
    kind: input.kind,
    boardId,
    detail: `kind=${input.kind} board=${boardId}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  templates.set(id, template);
  return cloneTemplate(template);
}

export function getTemplate(id: string): ReportTemplate | undefined {
  const template = templates.get(id.trim());
  return template ? cloneTemplate(template) : undefined;
}

export function listTemplates(filter?: {
  kind?: ReportTemplateKind;
}): ReportTemplate[] {
  let result = [...templates.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTemplate);
}

export function clearTemplates(): void {
  templates.clear();
}
