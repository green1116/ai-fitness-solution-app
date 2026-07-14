/**
 * E02-P7 — Knowledge Delivery schema (pure TS validation)
 */

import type { MemoryAgentRecommendation } from "../memory-agent/memory-agent.types";
import type {
  EnterpriseKnowledgePackage,
  KnowledgeDeliveryKernelInput,
  KnowledgeDeliveryLifecycleStage,
  KnowledgePackageSectionKind,
  KnowledgePackageStatus,
} from "./delivery.types";

export const KNOWLEDGE_DELIVERY_LIFECYCLE_STAGES: readonly KnowledgeDeliveryLifecycleStage[] =
  ["recommendation", "package", "seal"] as const;

export const KNOWLEDGE_PACKAGE_STATUSES: readonly KnowledgePackageStatus[] = [
  "pending",
  "assembled",
  "sealed",
  "failed",
] as const;

export const KNOWLEDGE_PACKAGE_SECTION_KINDS: readonly KnowledgePackageSectionKind[] = [
  "context_summary",
  "similarity_profile",
  "reuse_playbook",
  "evidence_bundle",
  "pricing_alignment",
  "compliance_checklist",
  "delivery_plan",
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

export function validateMemoryRecommendationInput(
  recommendation: unknown,
): SchemaResult<MemoryAgentRecommendation> {
  const issues: SchemaIssue[] = [];
  if (!recommendation || typeof recommendation !== "object") {
    return {
      ok: false,
      issues: [issue("recommendation", "recommendation is required")],
    };
  }

  const r = recommendation as Partial<MemoryAgentRecommendation>;
  if (!isNonEmptyString(r.id)) {
    issues.push(issue("recommendation.id", "id is required"));
  }
  if (!isNonEmptyString(r.title)) {
    issues.push(issue("recommendation.title", "title is required"));
  }
  if (!isNonEmptyString(r.contextId)) {
    issues.push(issue("recommendation.contextId", "contextId is required"));
  }
  if (!isNonEmptyString(r.profileId)) {
    issues.push(issue("recommendation.profileId", "profileId is required"));
  }
  if (r.status !== "ready" && r.status !== "drafted") {
    issues.push(issue("recommendation.status", "status must be ready|drafted"));
  }
  if (!Array.isArray(r.items) || r.items.length < 1) {
    issues.push(issue("recommendation.items", "items must be non-empty"));
  }
  if (r.readOnly !== true) {
    issues.push(issue("recommendation.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: recommendation as MemoryAgentRecommendation };
}

export function validateEnterpriseKnowledgePackage(
  pkg: unknown,
): SchemaResult<EnterpriseKnowledgePackage> {
  const issues: SchemaIssue[] = [];
  if (!pkg || typeof pkg !== "object") {
    return { ok: false, issues: [issue("package", "package is required")] };
  }

  const p = pkg as Partial<EnterpriseKnowledgePackage>;
  if (!isNonEmptyString(p.id)) issues.push(issue("package.id", "id is required"));
  if (!isNonEmptyString(p.recommendationId)) {
    issues.push(issue("package.recommendationId", "recommendationId is required"));
  }
  if (!isNonEmptyString(p.title)) issues.push(issue("package.title", "title is required"));
  if (
    typeof p.status !== "string" ||
    !(KNOWLEDGE_PACKAGE_STATUSES as readonly string[]).includes(p.status)
  ) {
    issues.push(
      issue(
        "package.status",
        `status must be one of: ${KNOWLEDGE_PACKAGE_STATUSES.join(", ")}`,
      ),
    );
  }
  if (!Array.isArray(p.sections) || p.sections.length < 1) {
    issues.push(issue("package.sections", "sections must be non-empty"));
  }
  if (!Array.isArray(p.recommendations) || p.recommendations.length < 1) {
    issues.push(issue("package.recommendations", "recommendations must be non-empty"));
  }
  if (!Array.isArray(p.checklist) || p.checklist.length < 1) {
    issues.push(issue("package.checklist", "checklist must be non-empty"));
  }
  if (
    typeof p.sectionCount === "number" &&
    Array.isArray(p.sections) &&
    p.sectionCount !== p.sections.length
  ) {
    issues.push(issue("package.sectionCount", "sectionCount must match sections.length"));
  }
  if (p.readOnly !== true) {
    issues.push(issue("package.readOnly", "readOnly must be true"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: pkg as EnterpriseKnowledgePackage };
}

export function validateKnowledgeDeliveryKernelInput(
  input: unknown,
): SchemaResult<KnowledgeDeliveryKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<KnowledgeDeliveryKernelInput>;
  const rec = validateMemoryRecommendationInput(i.recommendation);
  if (!rec.ok) issues.push(...rec.issues);

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as KnowledgeDeliveryKernelInput };
}

export function assertValidEnterpriseKnowledgePackage(
  pkg: EnterpriseKnowledgePackage,
): void {
  const result = validateEnterpriseKnowledgePackage(pkg);
  if (!result.ok) {
    throw new Error(
      `Invalid EnterpriseKnowledgePackage: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
