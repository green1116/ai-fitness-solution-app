/**
 * Product P3 — Project template registry
 */

import { PROJECT_TEMPLATE_KINDS } from "../project/project.constants";
import type {
  ProjectTemplate,
  ProjectTemplateKind,
  RegisterProjectTemplateInput,
} from "./template.types";

const templates = new Map<string, ProjectTemplate>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTemplate(template: ProjectTemplate): ProjectTemplate {
  return {
    ...template,
    defaultGoals: [...template.defaultGoals],
    metadata: { ...template.metadata },
  };
}

export function registerProjectTemplate(
  input: RegisterProjectTemplateInput,
): ProjectTemplate {
  const name = input.name.trim();
  if (!name) throw new Error("template.name is required");
  if (!(PROJECT_TEMPLATE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid project template kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("p3tmpl");
  if (templates.has(id)) {
    throw new Error(`project template already exists: ${id}`);
  }

  const defaultGoals = (input.defaultGoals ?? [])
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
  const description =
    (input.description ?? "").trim() || `${input.kind} template`;
  const template: ProjectTemplate = {
    id,
    kind: input.kind,
    name,
    description,
    defaultGoals,
    detail: `kind=${input.kind} goals=${defaultGoals.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  templates.set(id, template);
  return cloneTemplate(template);
}

export function getProjectTemplate(id: string): ProjectTemplate | undefined {
  const template = templates.get(id.trim());
  return template ? cloneTemplate(template) : undefined;
}

export function listProjectTemplates(filter?: {
  kind?: ProjectTemplateKind;
}): ProjectTemplate[] {
  let result = [...templates.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTemplate);
}

export function clearProjectTemplates(): void {
  templates.clear();
}
