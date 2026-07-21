/**
 * Launch P6 — Deployment Documentation
 * Integrates deployment package
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import {
  DEPLOYMENT_DOC_SECTIONS,
  DOCUMENT_STATUSES,
} from "./documentation.constants";
import { getDocumentationPackage } from "./documentation.package";
import type {
  CreateDeploymentDocumentationInput,
  DeploymentDocSection,
  DeploymentDocumentation,
  DocSectionRecord,
  DocumentStatus,
} from "./documentation.types";

const docs = new Map<string, DeploymentDocumentation>();

const SECTION_TITLES: Record<DeploymentDocSection, string> = {
  PREREQUISITES: "Prerequisites",
  INSTALLATION: "Installation",
  CONFIGURATION: "Configuration",
  VALIDATION: "Validation",
  ROLLBACK: "Rollback",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDoc(doc: DeploymentDocumentation): DeploymentDocumentation {
  return {
    ...doc,
    sections: doc.sections.map((s) => ({ ...s })),
    metadata: { ...doc.metadata },
  };
}

function initialSections(
  packageName: string,
  packageVersion: string,
): DocSectionRecord<DeploymentDocSection>[] {
  return DEPLOYMENT_DOC_SECTIONS.map((section) => ({
    section,
    title: SECTION_TITLES[section],
    body:
      section === "INSTALLATION"
        ? `Install ${packageName} ${packageVersion}`
        : `${SECTION_TITLES[section]} draft`,
    complete: false,
  }));
}

export function createDeploymentDocumentation(
  input: CreateDeploymentDocumentationInput,
): DeploymentDocumentation {
  const documentationPackageId = input.documentationPackageId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("deploymentDocumentation.title is required");

  const pkg = getDocumentationPackage(documentationPackageId);
  if (!pkg) {
    throw new Error(`documentation package not found: ${documentationPackageId}`);
  }

  const depl = getDeploymentPackage(pkg.deploymentPackageId);
  if (!depl) {
    throw new Error(`deployment package not found: ${pkg.deploymentPackageId}`);
  }

  const status = input.status ?? "DRAFT";
  if (!(DOCUMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid document status: ${status}`);
  }

  const id = input.id?.trim() || createId("deploydoc");
  if (docs.has(id)) {
    throw new Error(`deployment documentation already exists: ${id}`);
  }

  const doc: DeploymentDocumentation = {
    id,
    documentationPackageId,
    deploymentPackageId: depl.id,
    title,
    sections: initialSections(depl.name, depl.version),
    status,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  docs.set(id, doc);
  return cloneDoc(doc);
}

export function completeDeploymentDocumentationSections(
  id: string,
): DeploymentDocumentation {
  const doc = docs.get(id.trim());
  if (!doc) throw new Error(`deployment documentation not found: ${id}`);
  for (const section of doc.sections) {
    section.complete = true;
    if (section.body.endsWith("draft")) {
      section.body = `${section.title} content published`;
    }
  }
  doc.status = "PUBLISHED";
  doc.updatedAt = nowIso();
  docs.set(doc.id, doc);
  return cloneDoc(doc);
}

export function getDeploymentDocumentation(
  id: string,
): DeploymentDocumentation | undefined {
  const doc = docs.get(id.trim());
  return doc ? cloneDoc(doc) : undefined;
}

export function listDeploymentDocumentations(filter?: {
  documentationPackageId?: string;
  status?: DocumentStatus;
}): DeploymentDocumentation[] {
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

export function clearDeploymentDocumentations(): void {
  docs.clear();
}
