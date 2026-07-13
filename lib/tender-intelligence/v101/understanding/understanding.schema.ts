/**
 * E01-P2 — Tender Document Understanding schema (pure TS validation)
 */

import type { TenderWorkspace } from "../intake/intake.types";
import type {
  DocumentSection,
  DocumentSectionKind,
  DocumentStructure,
  RequirementCategory,
  RequirementIndex,
  RequirementIndexEntry,
  RequirementPriority,
  UnderstandingLifecycleStage,
  UnderstandingStatus,
} from "./understanding.types";

export const DOCUMENT_SECTION_KINDS: readonly DocumentSectionKind[] = [
  "cover",
  "scope",
  "technical",
  "commercial",
  "evaluation",
  "appendix",
  "other",
] as const;

export const REQUIREMENT_CATEGORIES: readonly RequirementCategory[] = [
  "functional",
  "technical",
  "equipment",
  "space",
  "compliance",
  "schedule",
  "budget",
  "deliverable",
  "other",
] as const;

export const REQUIREMENT_PRIORITIES: readonly RequirementPriority[] = [
  "must",
  "preferred",
  "optional",
] as const;

export const UNDERSTANDING_LIFECYCLE_STAGES: readonly UnderstandingLifecycleStage[] = [
  "workspace",
  "structure",
  "requirements",
] as const;

export const UNDERSTANDING_STATUSES: readonly UnderstandingStatus[] = [
  "pending",
  "structured",
  "indexed",
  "ready",
  "failed",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateTenderWorkspaceInput(
  workspace: unknown,
): SchemaResult<TenderWorkspace> {
  const issues: SchemaIssue[] = [];
  if (!workspace || typeof workspace !== "object") {
    return { ok: false, issues: [issue("workspace", "workspace is required")] };
  }

  const w = workspace as Partial<TenderWorkspace>;
  if (!isNonEmptyString(w.id)) issues.push(issue("workspace.id", "id is required"));
  if (!isNonEmptyString(w.intakeId)) issues.push(issue("workspace.intakeId", "intakeId is required"));
  if (!isNonEmptyString(w.sourceId)) issues.push(issue("workspace.sourceId", "sourceId is required"));
  if (!isNonEmptyString(w.title)) issues.push(issue("workspace.title", "title is required"));
  if (w.status !== "draft" && w.status !== "active" && w.status !== "archived") {
    issues.push(issue("workspace.status", "status must be draft|active|archived"));
  }
  if (w.readOnly !== true) issues.push(issue("workspace.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: workspace as TenderWorkspace };
}

export function validateDocumentSection(section: unknown): SchemaResult<DocumentSection> {
  const issues: SchemaIssue[] = [];
  if (!section || typeof section !== "object") {
    return { ok: false, issues: [issue("section", "section is required")] };
  }
  const s = section as Partial<DocumentSection>;
  if (!isNonEmptyString(s.id)) issues.push(issue("section.id", "id is required"));
  if (
    typeof s.kind !== "string" ||
    !(DOCUMENT_SECTION_KINDS as readonly string[]).includes(s.kind)
  ) {
    issues.push(issue("section.kind", `kind must be one of: ${DOCUMENT_SECTION_KINDS.join(", ")}`));
  }
  if (!isNonEmptyString(s.title)) issues.push(issue("section.title", "title is required"));
  if (typeof s.order !== "number" || !Number.isFinite(s.order) || s.order < 0) {
    issues.push(issue("section.order", "order must be a non-negative number"));
  }
  if (s.readOnly !== true) issues.push(issue("section.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: section as DocumentSection };
}

export function validateDocumentStructure(
  structure: unknown,
): SchemaResult<DocumentStructure> {
  const issues: SchemaIssue[] = [];
  if (!structure || typeof structure !== "object") {
    return { ok: false, issues: [issue("structure", "structure is required")] };
  }
  const d = structure as Partial<DocumentStructure>;
  if (!isNonEmptyString(d.id)) issues.push(issue("structure.id", "id is required"));
  if (!isNonEmptyString(d.workspaceId)) {
    issues.push(issue("structure.workspaceId", "workspaceId is required"));
  }
  if (!isNonEmptyString(d.title)) issues.push(issue("structure.title", "title is required"));
  if (!Array.isArray(d.sections)) {
    issues.push(issue("structure.sections", "sections must be an array"));
  } else {
    for (let i = 0; i < d.sections.length; i++) {
      const sectionResult = validateDocumentSection(d.sections[i]);
      if (!sectionResult.ok) {
        issues.push(
          ...sectionResult.issues.map((it) =>
            issue(`structure.sections[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
    if (typeof d.sectionCount === "number" && d.sectionCount !== d.sections.length) {
      issues.push(issue("structure.sectionCount", "sectionCount must match sections.length"));
    }
  }
  if (d.readOnly !== true) issues.push(issue("structure.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: structure as DocumentStructure };
}

export function validateRequirementIndexEntry(
  entry: unknown,
): SchemaResult<RequirementIndexEntry> {
  const issues: SchemaIssue[] = [];
  if (!entry || typeof entry !== "object") {
    return { ok: false, issues: [issue("entry", "entry is required")] };
  }
  const e = entry as Partial<RequirementIndexEntry>;
  if (!isNonEmptyString(e.id)) issues.push(issue("entry.id", "id is required"));
  if (!isNonEmptyString(e.sectionId)) issues.push(issue("entry.sectionId", "sectionId is required"));
  if (!isNonEmptyString(e.text)) issues.push(issue("entry.text", "text is required"));
  if (
    typeof e.category !== "string" ||
    !(REQUIREMENT_CATEGORIES as readonly string[]).includes(e.category)
  ) {
    issues.push(
      issue("entry.category", `category must be one of: ${REQUIREMENT_CATEGORIES.join(", ")}`),
    );
  }
  if (
    typeof e.priority !== "string" ||
    !(REQUIREMENT_PRIORITIES as readonly string[]).includes(e.priority)
  ) {
    issues.push(
      issue("entry.priority", `priority must be one of: ${REQUIREMENT_PRIORITIES.join(", ")}`),
    );
  }
  if (!Array.isArray(e.tags)) issues.push(issue("entry.tags", "tags must be an array"));
  if (e.readOnly !== true) issues.push(issue("entry.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: entry as RequirementIndexEntry };
}

export function validateRequirementIndex(index: unknown): SchemaResult<RequirementIndex> {
  const issues: SchemaIssue[] = [];
  if (!index || typeof index !== "object") {
    return { ok: false, issues: [issue("index", "requirement index is required")] };
  }
  const r = index as Partial<RequirementIndex>;
  if (!isNonEmptyString(r.id)) issues.push(issue("index.id", "id is required"));
  if (!isNonEmptyString(r.structureId)) {
    issues.push(issue("index.structureId", "structureId is required"));
  }
  if (!isNonEmptyString(r.workspaceId)) {
    issues.push(issue("index.workspaceId", "workspaceId is required"));
  }
  if (!Array.isArray(r.entries)) {
    issues.push(issue("index.entries", "entries must be an array"));
  } else {
    for (let i = 0; i < r.entries.length; i++) {
      const entryResult = validateRequirementIndexEntry(r.entries[i]);
      if (!entryResult.ok) {
        issues.push(
          ...entryResult.issues.map((it) =>
            issue(`index.entries[${i}].${it.path}`, it.message),
          ),
        );
      }
    }
    if (typeof r.entryCount === "number" && r.entryCount !== r.entries.length) {
      issues.push(issue("index.entryCount", "entryCount must match entries.length"));
    }
  }
  if (r.readOnly !== true) issues.push(issue("index.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: index as RequirementIndex };
}

export function assertValidWorkspace(workspace: TenderWorkspace): void {
  const result = validateTenderWorkspaceInput(workspace);
  if (!result.ok) {
    throw new Error(
      `Invalid TenderWorkspace: ${result.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
}
