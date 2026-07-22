/**
 * Commercialization P3 — Commercial terms
 */

import { TERM_KINDS } from "../pricing/pricing.constants";
import type {
  CommercialTerm,
  DefineCommercialTermInput,
  TermKind,
} from "./commercial.types";

const terms = new Map<string, CommercialTerm>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTerm(term: CommercialTerm): CommercialTerm {
  return { ...term };
}

export function defineCommercialTerm(
  input: DefineCommercialTermInput,
): CommercialTerm {
  const name = input.name.trim();
  const body = input.body.trim();
  if (!name) throw new Error("commercialTerm.name is required");
  if (!body) throw new Error("commercialTerm.body is required");
  if (!(TERM_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid term kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("term");
  if (terms.has(id)) {
    throw new Error(`commercial term already exists: ${id}`);
  }

  const term: CommercialTerm = {
    id,
    name,
    kind: input.kind,
    body,
    mandatory: input.mandatory ?? true,
    detail: `kind=${input.kind} mandatory=${input.mandatory ?? true}`,
    createdAt: nowIso(),
  };
  terms.set(id, term);
  return cloneTerm(term);
}

export function getCommercialTerm(id: string): CommercialTerm | undefined {
  const term = terms.get(id.trim());
  return term ? cloneTerm(term) : undefined;
}

export function listCommercialTerms(filter?: {
  kind?: TermKind;
  mandatory?: boolean;
}): CommercialTerm[] {
  let result = [...terms.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  if (filter?.mandatory !== undefined) {
    result = result.filter((t) => t.mandatory === filter.mandatory);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTerm);
}

export function clearCommercialTerms(): void {
  terms.clear();
}
