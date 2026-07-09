/**
 * V80 Pilot P2 — Type-safe requirement validation & safe merge (no field loss)
 */

import { z } from "zod";

import {
  EMPTY_TENDER_REQUIREMENTS,
  type RequirementItem,
  type TenderRequirements,
} from "./requirements.schema";

const requirementItemSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  pageRef: z.string().optional(),
  priority: z.enum(["must", "preferred", "optional"]).optional(),
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
  return patch.map((item, i) => ({
    id: item.id?.trim() || base[i]?.id || `req_${i}`,
    text: String(item.text ?? ""),
    pageRef: item.pageRef ?? base[i]?.pageRef,
    priority: item.priority ?? base[i]?.priority,
  }));
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
