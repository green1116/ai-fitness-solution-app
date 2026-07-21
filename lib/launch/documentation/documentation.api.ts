/**
 * Launch P6 — API Documentation Model
 * Integrates API product catalog
 */

import {
  getApiCatalogEntry,
  listApiCatalogEntries,
} from "../../product/e12/api/api.catalog";
import { API_DOC_SECTIONS, DOCUMENT_STATUSES } from "./documentation.constants";
import { getDocumentationPackage } from "./documentation.package";
import type {
  ApiDocSection,
  ApiDocumentation,
  CreateApiDocumentationInput,
  DocSectionRecord,
  DocumentStatus,
} from "./documentation.types";

const docs = new Map<string, ApiDocumentation>();

const SECTION_TITLES: Record<ApiDocSection, string> = {
  OVERVIEW: "API Overview",
  AUTHENTICATION: "Authentication",
  ENDPOINTS: "Endpoints",
  ERRORS: "Error Handling",
  EXAMPLES: "Examples",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDoc(doc: ApiDocumentation): ApiDocumentation {
  return {
    ...doc,
    apiCatalogEntryIds: [...doc.apiCatalogEntryIds],
    sections: doc.sections.map((s) => ({ ...s })),
    metadata: { ...doc.metadata },
  };
}

function initialSections(
  entrySummaries: string[],
): DocSectionRecord<ApiDocSection>[] {
  return API_DOC_SECTIONS.map((section) => ({
    section,
    title: SECTION_TITLES[section],
    body:
      section === "ENDPOINTS"
        ? entrySummaries.join("\n") || "No endpoints registered"
        : `${SECTION_TITLES[section]} draft`,
    complete: false,
  }));
}

export function createApiDocumentation(
  input: CreateApiDocumentationInput,
): ApiDocumentation {
  const documentationPackageId = input.documentationPackageId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("apiDocumentation.title is required");

  const pkg = getDocumentationPackage(documentationPackageId);
  if (!pkg) {
    throw new Error(`documentation package not found: ${documentationPackageId}`);
  }

  const apiCatalogEntryIds = input.apiCatalogEntryIds.map((id) => id.trim());
  if (apiCatalogEntryIds.length === 0) {
    throw new Error("apiDocumentation.apiCatalogEntryIds is required");
  }

  const summaries: string[] = [];
  for (const entryId of apiCatalogEntryIds) {
    const entry = getApiCatalogEntry(entryId);
    if (!entry || entry.productId !== pkg.productId) {
      throw new Error(`api catalog entry not found: ${entryId}`);
    }
    summaries.push(`${entry.path} [${entry.version}] — ${entry.name}`);
  }

  const status = input.status ?? "DRAFT";
  if (!(DOCUMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid document status: ${status}`);
  }

  const id = input.id?.trim() || createId("apidoc");
  if (docs.has(id)) throw new Error(`api documentation already exists: ${id}`);

  const doc: ApiDocumentation = {
    id,
    documentationPackageId,
    apiCatalogEntryIds,
    title,
    sections: initialSections(summaries),
    status,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  docs.set(id, doc);
  return cloneDoc(doc);
}

export function completeApiDocumentationSections(
  id: string,
): ApiDocumentation {
  const doc = docs.get(id.trim());
  if (!doc) throw new Error(`api documentation not found: ${id}`);
  for (const section of doc.sections) {
    section.complete = true;
    if (!section.body || section.body.endsWith("draft")) {
      section.body = `${section.title} content published`;
    }
  }
  doc.status = "PUBLISHED";
  doc.updatedAt = nowIso();
  docs.set(doc.id, doc);
  return cloneDoc(doc);
}

export function getApiDocumentation(id: string): ApiDocumentation | undefined {
  const doc = docs.get(id.trim());
  return doc ? cloneDoc(doc) : undefined;
}

export function listApiDocumentations(filter?: {
  documentationPackageId?: string;
  status?: DocumentStatus;
}): ApiDocumentation[] {
  let result = [...docs.values()];
  if (filter?.documentationPackageId) {
    const pid = filter.documentationPackageId.trim();
    result = result.filter((d) => d.documentationPackageId === pid);
  }
  if (filter?.status) result = result.filter((d) => d.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDoc);
}

export function listLinkedApiCatalogEntries(
  documentationPackageId: string,
): string[] {
  const ids = new Set<string>();
  for (const doc of listApiDocumentations({ documentationPackageId })) {
    for (const id of doc.apiCatalogEntryIds) ids.add(id);
  }
  // Also surface catalog entries for product when package exists
  const pkg = getDocumentationPackage(documentationPackageId);
  if (pkg) {
    for (const entry of listApiCatalogEntries({ productId: pkg.productId })) {
      ids.add(entry.id);
    }
  }
  return [...ids].sort();
}

export function clearApiDocumentations(): void {
  docs.clear();
}
