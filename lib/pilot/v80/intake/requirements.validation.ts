/**
 * V80 Pilot P2 — Type-safe requirement validation & safe merge (no field loss)
 */

import { z } from "zod";

import { listEvidenceGateIssues } from "./confidence.service";
import {
  EMPTY_TENDER_REQUIREMENTS,
  type RequirementItem,
  type TenderRequirements,
} from "./requirements.schema";

const evidenceSpanSchema = z.object({
  page: z.number().int().positive(),
  excerpt: z.string(),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().nonnegative().optional(),
  documentId: z.string().optional(),
  documentName: z.string().optional(),
});

const requirementItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  pageRef: z.string().optional(),
  priority: z.enum(["must", "preferred", "optional"]).optional(),
  reviewStatus: z.enum(["pending", "confirmed", "rejected"]).optional(),
  evidence: z.array(evidenceSpanSchema).optional(),
  confidence: z.number().min(0).max(1).optional(),
  confidenceBand: z.enum(["high", "medium", "low"]).optional(),
  evidenceOverride: z.boolean().optional(),
  evidenceOverrideNote: z.string().optional(),
  sourceDocumentId: z.string().optional(),
  sourceDocumentName: z.string().optional(),
});

const pageRefSchema = z.object({
  page: z.number().int().positive(),
  excerpt: z.string(),
});

export const tenderRequirementsSchema = z.object({
  projectName: z.string(),
  organization: z.string(),
  industry: z.string(),
  location: z.string(),
  objectives: z.array(z.string()),
  scope: z.string(),
  functionalRequirements: z.array(requirementItemSchema),
  technicalRequirements: z.array(requirementItemSchema),
  equipment: z.array(requirementItemSchema),
  space: z.array(requirementItemSchema),
  quantity: z.array(requirementItemSchema),
  constraints: z.array(requirementItemSchema),
  compliance: z.array(requirementItemSchema),
  standards: z.array(requirementItemSchema),
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string(),
    notes: z.string(),
  }),
  schedule: z.object({
    deadline: z.string().optional(),
    milestones: z.array(z.string()),
  }),
  evaluation: z.array(requirementItemSchema),
  deliverables: z.array(z.string()),
  risks: z.array(z.string()),
  optionalItems: z.array(requirementItemSchema),
  sourceRefs: z.array(pageRefSchema),
});

export type RequirementValidationIssue = {
  path: string;
  message: string;
};

export type RequirementValidationResult = {
  valid: boolean;
  errors: RequirementValidationIssue[];
  requirements?: TenderRequirements;
};

export class IntakeValidationError extends Error {
  readonly code = "VALIDATION_FAILED";
  readonly status = 422;
  readonly errors: RequirementValidationIssue[];

  constructor(errors: RequirementValidationIssue[]) {
    super("Requirement validation failed");
    this.name = "IntakeValidationError";
    this.errors = errors;
  }
}

function coalesceItems(
  base: RequirementItem[],
  patch: RequirementItem[] | undefined,
): RequirementItem[] {
  if (patch === undefined) return base;
  return patch.map((item, i) => {
    const prev = base[i];
    return {
      id: item.id?.trim() || prev?.id || `req_${i}`,
      text: String(item.text ?? ""),
      pageRef: item.pageRef ?? prev?.pageRef,
      priority: item.priority ?? prev?.priority,
      reviewStatus: item.reviewStatus ?? prev?.reviewStatus ?? "pending",
      evidence: item.evidence ?? prev?.evidence,
      confidence: item.confidence ?? prev?.confidence,
      confidenceBand: item.confidenceBand ?? prev?.confidenceBand,
      evidenceOverride: item.evidenceOverride ?? prev?.evidenceOverride,
      evidenceOverrideNote: item.evidenceOverrideNote ?? prev?.evidenceOverrideNote,
      sourceDocumentId: item.sourceDocumentId ?? prev?.sourceDocumentId,
      sourceDocumentName: item.sourceDocumentName ?? prev?.sourceDocumentName,
    };
  });
}

/** Deep-merge patch onto base — arrays replaced only when patch includes them */
export function mergeTenderRequirements(
  base: TenderRequirements,
  patch: Partial<TenderRequirements>,
): TenderRequirements {
  return {
    projectName: patch.projectName ?? base.projectName,
    organization: patch.organization ?? base.organization,
    industry: patch.industry ?? base.industry,
    location: patch.location ?? base.location,
    objectives: patch.objectives ?? base.objectives,
    scope: patch.scope ?? base.scope,
    functionalRequirements: coalesceItems(base.functionalRequirements, patch.functionalRequirements),
    technicalRequirements: coalesceItems(base.technicalRequirements, patch.technicalRequirements),
    equipment: coalesceItems(base.equipment, patch.equipment),
    space: coalesceItems(base.space, patch.space),
    quantity: coalesceItems(base.quantity, patch.quantity),
    constraints: coalesceItems(base.constraints, patch.constraints),
    compliance: coalesceItems(base.compliance, patch.compliance),
    standards: coalesceItems(base.standards, patch.standards),
    budget: { ...base.budget, ...(patch.budget ?? {}) },
    schedule: {
      ...base.schedule,
      ...(patch.schedule ?? {}),
      milestones: patch.schedule?.milestones ?? base.schedule.milestones,
    },
    evaluation: coalesceItems(base.evaluation, patch.evaluation),
    deliverables: patch.deliverables ?? base.deliverables,
    risks: patch.risks ?? base.risks,
    optionalItems: coalesceItems(base.optionalItems, patch.optionalItems),
    sourceRefs: patch.sourceRefs ?? base.sourceRefs,
  };
}

export function parseTenderRequirements(input: unknown): TenderRequirements {
  const merged = {
    ...EMPTY_TENDER_REQUIREMENTS,
    ...(typeof input === "object" && input !== null ? input : {}),
  };
  return tenderRequirementsSchema.parse(merged);
}

function hasRequirementContent(req: TenderRequirements): boolean {
  return (
    req.scope.trim().length > 0 ||
    req.objectives.some((o) => o.trim().length > 0) ||
    req.functionalRequirements.some((r) => r.text.trim().length > 0) ||
    req.technicalRequirements.some((r) => r.text.trim().length > 0)
  );
}

/** Schema + business rules for approval */
export function validateTenderRequirementsForApproval(
  input: unknown,
): RequirementValidationResult {
  const errors: RequirementValidationIssue[] = [];

  let requirements: TenderRequirements;
  try {
    requirements = parseTenderRequirements(input);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        valid: false,
        errors: err.issues.map((i) => ({
          path: i.path.join(".") || "root",
          message: i.message,
        })),
      };
    }
    throw err;
  }

  if (!requirements.projectName.trim()) {
    errors.push({ path: "projectName", message: "项目名称必填" });
  }
  if (!requirements.organization.trim() && !requirements.projectName.trim()) {
    errors.push({ path: "organization", message: "招标单位或项目名称至少填一项" });
  }
  if (!hasRequirementContent(requirements)) {
    errors.push({
      path: "scope",
      message: "范围、目标或技术/功能需求至少填写一项",
    });
  }
  if (requirements.budget.min !== undefined && requirements.budget.max !== undefined) {
    if (requirements.budget.min > requirements.budget.max) {
      errors.push({ path: "budget.max", message: "预算上限不能低于下限" });
    }
  }

  // P2 — must items that are not rejected must be confirmed before approval
  const mustLists: Array<{ key: string; items: RequirementItem[] }> = [
    { key: "functionalRequirements", items: requirements.functionalRequirements },
    { key: "technicalRequirements", items: requirements.technicalRequirements },
    { key: "equipment", items: requirements.equipment },
    { key: "space", items: requirements.space },
    { key: "quantity", items: requirements.quantity },
    { key: "constraints", items: requirements.constraints },
    { key: "compliance", items: requirements.compliance },
    { key: "standards", items: requirements.standards },
    { key: "evaluation", items: requirements.evaluation },
  ];
  for (const list of mustLists) {
    list.items.forEach((item, index) => {
      if (!item.text.trim()) return;
      const priority = item.priority ?? "must";
      if (priority !== "must") return;
      if (item.reviewStatus === "rejected") return;
      if (item.reviewStatus !== "confirmed") {
        errors.push({
          path: `${list.key}.${index}`,
          message: `必选需求尚未确认：${item.text.slice(0, 40)}`,
        });
      }
    });
  }

  // P5 — low-confidence / missing-evidence items need explicit confirmation (or override)
  for (const issue of listEvidenceGateIssues(requirements)) {
    if (errors.some((e) => e.path === issue.path && e.message === issue.message)) continue;
    errors.push({ path: issue.path, message: issue.message });
  }

  return {
    valid: errors.length === 0,
    errors,
    requirements: errors.length === 0 ? requirements : undefined,
  };
}

export function assertValidForApproval(input: unknown): TenderRequirements {
  const result = validateTenderRequirementsForApproval(input);
  if (!result.valid || !result.requirements) {
    throw new IntakeValidationError(result.errors);
  }
  return result.requirements;
}
