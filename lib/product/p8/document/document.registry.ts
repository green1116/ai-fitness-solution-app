/**
 * Product P8 — Document registry
 */

import { DOCUMENT_KINDS } from "../tender/tender.constants";
import { getTender } from "../tender/tender.registry";
import type {
  CreateDocumentInput,
  DocumentKind,
  TenderDocument,
} from "./document.types";

const documents = new Map<string, TenderDocument>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDocument(document: TenderDocument): TenderDocument {
  return { ...document, metadata: { ...document.metadata } };
}

export function createDocument(input: CreateDocumentInput): TenderDocument {
  const tenderId = input.tenderId.trim();
  const title = input.title.trim();
  if (!tenderId) throw new Error("document.tenderId is required");
  if (!title) throw new Error("document.title is required");
  if (!(DOCUMENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid document kind: ${input.kind}`);
  }
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }

  const id = input.id?.trim() || createId("p8doc");
  if (documents.has(id)) {
    throw new Error(`document already exists: ${id}`);
  }

  const sourceRef = (input.sourceRef ?? "").trim() || title;
  const document: TenderDocument = {
    id,
    tenderId,
    kind: input.kind,
    title,
    sourceRef,
    detail: `kind=${input.kind} title=${title}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  documents.set(id, document);
  return cloneDocument(document);
}

export function getDocument(id: string): TenderDocument | undefined {
  const document = documents.get(id.trim());
  return document ? cloneDocument(document) : undefined;
}

export function listDocuments(filter?: {
  tenderId?: string;
  kind?: DocumentKind;
}): TenderDocument[] {
  let result = [...documents.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((d) => d.tenderId === tid);
  }
  if (filter?.kind) result = result.filter((d) => d.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDocument);
}

export function clearDocuments(): void {
  documents.clear();
}
