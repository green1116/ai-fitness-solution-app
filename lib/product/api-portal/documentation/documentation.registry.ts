/**
 * Product API Portal — documentation registry (no runtime rendering)
 */

import { PORTAL_DOC_KINDS } from "../management/management.constants";
import { getPortal } from "../registry/portal.registry";
import type {
  PortalDocKind,
  PortalDocument,
  RegisterPortalDocumentInput,
} from "./documentation.types";

const documents = new Map<string, PortalDocument>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function normalizeSlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  return trimmed || "index";
}

function cloneDocument(doc: PortalDocument): PortalDocument {
  return { ...doc, metadata: { ...doc.metadata } };
}

export function registerPortalDocument(
  input: RegisterPortalDocumentInput,
): PortalDocument {
  const portalId = input.portalId.trim();
  const docKey = input.docKey.trim().toUpperCase();
  const title = input.title.trim();
  const slug = normalizeSlug(input.slug);
  if (!portalId) throw new Error("document.portalId is required");
  if (!docKey) throw new Error("document.docKey is required");
  if (!title) throw new Error("document.title is required");
  if (!(PORTAL_DOC_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid document kind: ${input.kind}`);
  }

  const portal = getPortal(portalId);
  if (!portal) throw new Error(`portal not found: ${portalId}`);
  if (portal.status !== "ACTIVE") {
    throw new Error(`portal not active: ${portalId}`);
  }

  const duplicateKey = [...documents.values()].find(
    (d) => d.portalId === portalId && d.docKey === docKey,
  );
  if (duplicateKey) throw new Error(`docKey already exists: ${docKey}`);

  const duplicateSlug = [...documents.values()].find(
    (d) => d.portalId === portalId && d.slug === slug,
  );
  if (duplicateSlug) throw new Error(`slug already exists: ${slug}`);

  const id = input.id?.trim() || createId("apiportaldoc");
  if (documents.has(id)) throw new Error(`document already exists: ${id}`);

  const document: PortalDocument = {
    id,
    portalId,
    docKey,
    kind: input.kind,
    title,
    slug,
    detail: `kind=${input.kind} slug=${slug}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  documents.set(id, document);
  return cloneDocument(document);
}

export function getPortalDocument(id: string): PortalDocument | undefined {
  const document = documents.get(id.trim());
  return document ? cloneDocument(document) : undefined;
}

export function listPortalDocuments(filter?: {
  portalId?: string;
  kind?: PortalDocKind;
}): PortalDocument[] {
  let result = [...documents.values()];
  if (filter?.portalId) {
    const portalId = filter.portalId.trim();
    result = result.filter((d) => d.portalId === portalId);
  }
  if (filter?.kind) result = result.filter((d) => d.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.docKey.localeCompare(b.docKey))
    .map(cloneDocument);
}

export function clearPortalDocuments(): void {
  documents.clear();
}
