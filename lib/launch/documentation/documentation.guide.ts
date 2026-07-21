/**
 * Launch P6 — Customer Guide
 * Integrates SLA support + security readiness context
 */

import {
  CUSTOMER_GUIDE_SECTIONS,
  DOCUMENT_STATUSES,
} from "./documentation.constants";
import { getDocumentationPackage } from "./documentation.package";
import type {
  CreateCustomerGuideInput,
  CustomerGuide,
  CustomerGuideSection,
  DocSectionRecord,
  DocumentStatus,
} from "./documentation.types";

const guides = new Map<string, CustomerGuide>();

const SECTION_TITLES: Record<CustomerGuideSection, string> = {
  GETTING_STARTED: "Getting Started",
  WORKSPACES: "Workspaces",
  BILLING: "Billing",
  SUPPORT: "Support & SLA",
  SECURITY: "Security",
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGuide(guide: CustomerGuide): CustomerGuide {
  return {
    ...guide,
    sections: guide.sections.map((s) => ({ ...s })),
    metadata: { ...guide.metadata },
  };
}

function initialSections(pkg: {
  supportSlaProfileId?: string;
  securityProfileId?: string;
}): DocSectionRecord<CustomerGuideSection>[] {
  return CUSTOMER_GUIDE_SECTIONS.map((section) => {
    let body = `${SECTION_TITLES[section]} draft`;
    if (section === "SUPPORT" && pkg.supportSlaProfileId) {
      body = `Support package linked: ${pkg.supportSlaProfileId}`;
    }
    if (section === "SECURITY" && pkg.securityProfileId) {
      body = `Security profile linked: ${pkg.securityProfileId}`;
    }
    return {
      section,
      title: SECTION_TITLES[section],
      body,
      complete: false,
    };
  });
}

export function createCustomerGuide(
  input: CreateCustomerGuideInput,
): CustomerGuide {
  const documentationPackageId = input.documentationPackageId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("customerGuide.title is required");

  const pkg = getDocumentationPackage(documentationPackageId);
  if (!pkg) {
    throw new Error(`documentation package not found: ${documentationPackageId}`);
  }

  const status = input.status ?? "DRAFT";
  if (!(DOCUMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid document status: ${status}`);
  }

  const id = input.id?.trim() || createId("custguide");
  if (guides.has(id)) throw new Error(`customer guide already exists: ${id}`);

  const guide: CustomerGuide = {
    id,
    documentationPackageId,
    title,
    audience: input.audience?.trim() || "customer-admin",
    sections: initialSections(pkg),
    status,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  guides.set(id, guide);
  return cloneGuide(guide);
}

export function completeCustomerGuideSections(id: string): CustomerGuide {
  const guide = guides.get(id.trim());
  if (!guide) throw new Error(`customer guide not found: ${id}`);
  for (const section of guide.sections) {
    section.complete = true;
    if (section.body.endsWith("draft")) {
      section.body = `${section.title} content published`;
    }
  }
  guide.status = "PUBLISHED";
  guide.updatedAt = nowIso();
  guides.set(guide.id, guide);
  return cloneGuide(guide);
}

export function getCustomerGuide(id: string): CustomerGuide | undefined {
  const guide = guides.get(id.trim());
  return guide ? cloneGuide(guide) : undefined;
}

export function listCustomerGuides(filter?: {
  documentationPackageId?: string;
  status?: DocumentStatus;
}): CustomerGuide[] {
  let result = [...guides.values()];
  if (filter?.documentationPackageId) {
    const pid = filter.documentationPackageId.trim();
    result = result.filter((g) => g.documentationPackageId === pid);
  }
  if (filter?.status) result = result.filter((g) => g.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneGuide);
}

export function clearCustomerGuides(): void {
  guides.clear();
}
