/**
 * Product P5 — Proposal template registry
 */

import { PROPOSAL_TEMPLATE_KINDS } from "../proposal/proposal.constants";
import type {
  ProposalTemplate,
  ProposalTemplateKind,
  RegisterProposalTemplateInput,
} from "./template.types";

const templates = new Map<string, ProposalTemplate>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTemplate(template: ProposalTemplate): ProposalTemplate {
  return {
    ...template,
    defaultSections: [...template.defaultSections],
    metadata: { ...template.metadata },
  };
}

export function registerProposalTemplate(
  input: RegisterProposalTemplateInput,
): ProposalTemplate {
  const name = input.name.trim();
  if (!name) throw new Error("template.name is required");
  if (!(PROPOSAL_TEMPLATE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid proposal template kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("p5tmpl");
  if (templates.has(id)) {
    throw new Error(`proposal template already exists: ${id}`);
  }

  const defaultSections = (input.defaultSections ?? [
    "EXECUTIVE_SUMMARY",
    "SOLUTION_OVERVIEW",
    "DIFFERENTIATOR",
  ])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const description =
    (input.description ?? "").trim() || `${input.kind} proposal template`;
  const template: ProposalTemplate = {
    id,
    kind: input.kind,
    name,
    description,
    defaultSections,
    detail: `kind=${input.kind} sections=${defaultSections.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  templates.set(id, template);
  return cloneTemplate(template);
}

export function getProposalTemplate(id: string): ProposalTemplate | undefined {
  const template = templates.get(id.trim());
  return template ? cloneTemplate(template) : undefined;
}

export function listProposalTemplates(filter?: {
  kind?: ProposalTemplateKind;
}): ProposalTemplate[] {
  let result = [...templates.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTemplate);
}

export function clearProposalTemplates(): void {
  templates.clear();
}
