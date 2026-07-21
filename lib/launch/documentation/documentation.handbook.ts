/**
 * Launch P6 — Operation Handbook
 */

import { DOCUMENT_STATUSES, HANDBOOK_SECTIONS } from "./documentation.constants";
import { getDocumentationPackage } from "./documentation.package";
import type {
  CreateOperationHandbookInput,
  DocSectionRecord,
  DocumentStatus,
  HandbookSection,
  OperationHandbook,
} from "./documentation.types";

const handbooks = new Map<string, OperationHandbook>();

const SECTION_TITLES: Record<HandbookSection, string> = {
  RUNBOOKS: "Runbooks",
  MONITORING: "Monitoring",
  INCIDENT_RESPONSE: "Incident Response",
  ESCALATION: "Escalation",
  CHANGE_MANAGEMENT: "Change Management",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneHandbook(handbook: OperationHandbook): OperationHandbook {
  return {
    ...handbook,
    sections: handbook.sections.map((s) => ({ ...s })),
    metadata: { ...handbook.metadata },
  };
}

function initialSections(): DocSectionRecord<HandbookSection>[] {
  return HANDBOOK_SECTIONS.map((section) => ({
    section,
    title: SECTION_TITLES[section],
    body: `${SECTION_TITLES[section]} draft`,
    complete: false,
  }));
}

export function createOperationHandbook(
  input: CreateOperationHandbookInput,
): OperationHandbook {
  const documentationPackageId = input.documentationPackageId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("operationHandbook.title is required");

  const pkg = getDocumentationPackage(documentationPackageId);
  if (!pkg) {
    throw new Error(`documentation package not found: ${documentationPackageId}`);
  }

  const status = input.status ?? "DRAFT";
  if (!(DOCUMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid document status: ${status}`);
  }

  const id = input.id?.trim() || createId("ophbook");
  if (handbooks.has(id)) {
    throw new Error(`operation handbook already exists: ${id}`);
  }

  const handbook: OperationHandbook = {
    id,
    documentationPackageId,
    title,
    sections: initialSections(),
    status,
    metadata: {
      ...(input.metadata ?? {}),
      supportSlaProfileId: pkg.supportSlaProfileId,
      securityProfileId: pkg.securityProfileId,
    },
    updatedAt: nowIso(),
  };
  handbooks.set(id, handbook);
  return cloneHandbook(handbook);
}

export function completeOperationHandbookSections(
  id: string,
): OperationHandbook {
  const handbook = handbooks.get(id.trim());
  if (!handbook) throw new Error(`operation handbook not found: ${id}`);
  for (const section of handbook.sections) {
    section.complete = true;
    if (section.body.endsWith("draft")) {
      section.body = `${section.title} content published`;
    }
  }
  handbook.status = "PUBLISHED";
  handbook.updatedAt = nowIso();
  handbooks.set(handbook.id, handbook);
  return cloneHandbook(handbook);
}

export function getOperationHandbook(
  id: string,
): OperationHandbook | undefined {
  const handbook = handbooks.get(id.trim());
  return handbook ? cloneHandbook(handbook) : undefined;
}

export function listOperationHandbooks(filter?: {
  documentationPackageId?: string;
  status?: DocumentStatus;
}): OperationHandbook[] {
  let result = [...handbooks.values()];
  if (filter?.documentationPackageId) {
    const pid = filter.documentationPackageId.trim();
    result = result.filter((h) => h.documentationPackageId === pid);
  }
  if (filter?.status) result = result.filter((h) => h.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneHandbook);
}

export function clearOperationHandbooks(): void {
  handbooks.clear();
}
